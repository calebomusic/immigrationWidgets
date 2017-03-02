import { merge } from 'lodash';

function generateGraph(data, graphLocationId, xKey, yKey, options) {
  var defaults = {
    xAxisText: '',
    yAxisText: '',
    xTicks: 8,
    yTicks: 8,
    xMin: 0,
    xMax: Math.max.apply(data.map( d => d[xKey])),
    yMin: 0,
    yMax: Math.max.apply(data.map( d => d[yKey])),
    xAxisLabelFormat: '',
    yAxisLabelFormat: '',
    radius: 6,
    margin: { top: 15, right: 20, bottom: 50, left: 70 },
    width: 570,
    height: 340,
    guessDist: false,
    otherData: []
  }

  options = merge(defaults, options);

  // Assign all options keys to variables of the same name in the function scope
  var [
        guessDist,
        height,
        margin,
        otherData,
        radius,
        width,
        xAxisLabelFormat,
        xAxisText,
        xMax,
        xMin,
        xTicks,
        yAxisLabelFormat,
        yAxisText,
        yMax,
        yMin,
        yTicks
      ] = Object.keys(options)
                  .sort()
                  .map( (k) => options[k] );

  var svg = d3.select('#' + graphLocationId)
    .append('svg:svg')
      .attr('id', 'svg-' + graphLocationId)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .attr('offset', 100)
      .append("g")
      .attr("transform",
        "translate(37,40)")
      // .attr('style', "-webkit-tap-highlight-color: rgba(0, 0, 0, 0);");

  var xScale = d3.scaleLinear()
        .domain(d3.extent(data, (d) => d[xKey]))
        .range([0, width])

  var yScale = d3.scaleLinear()
        .domain([yMin, yMax])
        .range([height, 0]);

  // Init grids, axes, and other paths
  drawGrid();
  drawAxes();
  drawOtherPaths();

  function drawAxes() {
    svg.append("g")
        .attr('class', 'axisX')
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale)
                .tickFormat(d3.format(xAxisLabelFormat))
                .ticks(xTicks)
              );

    svg.append("text")
        .attr("transform",
              "translate(" + (width - margin.right) + " ," +
                             (height + margin.top + 10) + ")")
        .style("font-size", "12px")
        .text(xAxisText);

    svg.append("g")
      .call(d3.axisLeft(yScale)
              .tickFormat(d3.format(yAxisLabelFormat))
              .ticks(yTicks)
            );

    svg.append("text")
        .attr('x', -30)
        .attr("y", -30)
        .attr("dy", "1em")
        .style("font-size", "12px")
        .text(yAxisText);
  }

  function make_x_gridlines() {
      return d3.axisBottom(xScale)
          .ticks(xTicks)
  }

  function make_y_gridlines() {
      return d3.axisLeft(yScale)
          .ticks(yTicks)
  }

  function drawGrid () {
    svg.append("g")
          .attr("class", "grid")
          .attr("transform", "translate(0," + height + ")")
          .call(make_x_gridlines()
              .tickSize(-height)
              .tickFormat(""))

    svg.append("g")
        .attr("class", "grid")
        .call(make_y_gridlines()
            .tickSize(-width)
            .tickFormat("")
        )
  }

  // If there is other data don't include init header, otherwise include it
  var initText = otherData.length === 0 ? 'Draw your Line!' : '';

  svg.append('text')
    .attr('id', 'drawYourLine')
    .attr("transform",
          "translate(" + (width/2 + 2) + " ," +
                         (height/2 - 2) + ")")
    .style('text-anchor', 'middle')
    .style("font-size", "26px")
    .text(initText);

  var guessData;
  if (guessDist) {
    guessData = [];

    for(let i = data[0][xKey]; i <= data[data.length-1][xKey]; i ++) {
      guessData.push({ [xKey]: i, [yKey]: yMin, defined: false})
    }
  } else {
    guessData = data
        .map((d) => {
          return { [xKey]: d[xKey], [yKey]: d[yKey], defined: false }
        });
  }

  var guessXDist = (guessData[1][xKey] - guessData[0][xKey]) / 2;
  
  var body = d3.select('#svg-' + graphLocationId)
  var drag = d3.drag().on("drag", dragHandler);
  body.call(drag);

  // Init with otherDrawn set to false, set to true when other data lines are drawn
  var otherDrawn = false;

  function dragHandler() {
    var coord = d3.mouse(this),
        // Note adjustments nec due to transform translate(37, 40)
        xVal = clamp(xMin, xMax, xScale.invert(coord[0] - 37)),
        yVal = clamp(yMin, yMax, yScale.invert(coord[1] - 40));

    svg.select('.hoverText').remove();
    svg.select("#drawYourLine").remove();
    guessData.forEach(function(d) {
      if (Math.abs(d[xKey] - xVal) < guessXDist) {
        d[yKey] = yVal;
        d.defined = true;
      } else if(d[xKey] < xVal && !d.defined){
        d[yKey] = yVal;
        d.defined = true;
      }
    });

    var defined = selectDefined(guessData),
        incomplete = selectIncomplete(defined),
        beforeAnswer = document.getElementById('beforeGuess-' + graphLocationId);

    if(complete(defined) && defined.length === guessData.length) {
      beforeAnswer.classList.remove('beforeGuessComplete-' + graphLocationId);
      beforeAnswer.classList.add('afterGuessComplete-' + graphLocationId);

      beforeAnswer.addEventListener('click', drawAnswerPath);
    } else {
      beforeAnswer.removeEventListener('click', drawAnswerPath);
    }

    drawCircles('guessCirclesG', defined, '#FF4136');
    drawPath(defined);
    drawIncompleteRange(incomplete);
  }

  function handleMouseOver(d, i) {
    var id = "t" + Math.round(d[xKey]) + "-" + Math.round(d[yKey] * 100) + "-" + i,
        datum = d[yKey];

    if(yAxisLabelFormat.match(/%/)) {
      datum = (d[yKey] * 100).toFixed(1) + '%';
    }
    d3.select(this)
      .attr('fill', '#ffc700')
      .attr('r', radius + 1)

      svg.append("text")
        .attr( 'id', id)
        .attr('class', 'hoverText')
        .attr('x', () => width / 2 - 18)
        .attr('y', () => -14)
        .text(() => [d[xKey] + ': ' + datum] );
  }

  function handleMouseOut(color) {
      return function(d, i) {
        var id = "t" + Math.round(d[xKey]) + "-" + Math.round(d[yKey] * 100) + "-" + i

        d3.select(this)
          .attr('fill', color)
          .attr('r', radius)

        d3.select("#" + id).remove();
      }
  }

  function complete(data) {
    for(let d of data) {
      if(d['defined'] === undefined) {
        return false
      }
    }

    return true;
  }

  // Three lines for three paths
  var answerLine = d3.line()
    .x(d => xScale(d[xKey]))
    .y(d => yScale(d[yKey]));

  var guessLine = d3.line()
    .x(d => xScale(d[xKey]))
    .y(d => yScale(d[yKey]));

  var incompleteRangeLine = d3.line()
    .x(d => xScale(d[xKey]))
    .y(d => yScale(d[yKey]));

  // Select defined data
  function selectDefined(data) {
    var defined = [];
    for(var d of data) {
      if(d.defined) {
        defined.push(d);
      }
    }

    return defined;
  }

  // Select points for incomplete data range
  function selectIncomplete(guessData) {
    if(data.length === guessData.length) {
      return [];
    } else {
      var firstIncompleteX = guessData[guessData.length - 1][xKey];
      return [
        { [xKey]: firstIncompleteX, [yKey]: yMin, defined: true},
        { [xKey]: firstIncompleteX, [yKey]: yMax, defined: true},
        { [xKey]: xMax, [yKey]: yMax, defined: true},
        { [xKey]: xMax, [yKey]: yMin, defined: true}
      ]
    }
  }

  var path = svg.append('path');

  function drawCircles(id, data, color) {
    svg.select('#' + id).remove();

    var originalRadius = id === 'answerCirclesG' ? 0 : radius;

    svg
      .append('g')
      .attr('id', id)
      .selectAll('circle')
      .data(data)
      .enter()
        .append('circle')
        .attr('r', originalRadius)
        .attr('cx', d => xScale(d[xKey]))
        .attr('cy', d => yScale(d[yKey]))
        .attr('fill', color)
        .attr('class', 'guessCircles')
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut(color))
        .transition()
          .duration(3000)
          .attr('r', radius)
  }

  function drawPath(data) {
      path
        .attr('d', guessLine.defined((d) => d.defined)(data))
        .attr('class', 'guessLine')
  }

  function drawOtherPaths() {
    for (var i = 0; i < otherData.length; i++) {
      var otherDatum = otherData[i],
          otherLine = d3.line()
            .x(d => xScale(d[xKey]))
            .y(d => yScale(d[yKey]));

      drawOtherPath(otherDatum, otherLine, '#05E177', 'otherPath-' + i)
      var otherPath = svg.append('path');

      otherPath
        .data([otherDatum])
        .attr('d', otherLine)
        .attr('class', 'otherLine1')
    }
  }

  var incompleteRange = svg.append('path');

  function drawIncompleteRange(incomplete) {
    incompleteRange
      .attr('d', incompleteRangeLine.defined(d => d.defined)(incomplete))
      .attr('class', 'incompleteRange')
  }

  // declareAnswerPath
  function drawOtherPath(data, line, color, name) {
    var path = svg
      .append('path')
      .data([data])
      .attr('class', 'answerLine')
      .attr('stroke-width', 2)
      .attr('d', line)

    var length = path.node().getTotalLength()

    path.attr("stroke-dasharray", length + " " + length)
       .attr("stroke-dashoffset", length)
       .transition()
         .duration(2000)
         .attr("stroke-dashoffset", 0);

    drawCircles(name + 'CirclesG', data, color);
  }

  function drawAnswerPath() {
    var answerText = document.getElementById('answerText-' + graphLocationId),
        beforeGuess = document.getElementById('beforeGuess-' + graphLocationId);

    drawOtherPath(data, answerLine, 'steelblue', 'answer');

    answerText.classList.remove('hidden');
    beforeGuess.classList.remove('afterGuessComplete-' + graphLocationId);
    beforeGuess.classList.add('beforeGuessComplete-' + graphLocationId);
  }

  function clamp(a, b, c){
    return Math.max(a, Math.min(b, c));
  }
}

module.exports = generateGraph;
