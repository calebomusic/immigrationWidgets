import { merge } from 'lodash';

function generateGraph(data, graphLocationId, xKey, yKey, options) {
  var defaults = {
    xAxisText: '',
    yAxisText: '',
    xMin: 0,
    xMax: Math.max.apply(data.map( d => d[xKey])),
    yMin: 0,
    yMax: Math.max.apply(data.map( d => d[yKey])),
    xAxisLabelFormat: '',
    yAxisLabelFormat: '',
    radius: 6,
    margin: { top: 15, right: 20, bottom: 50, left: 70 },
    width: 570,
    height: 340
  }

  options = merge(defaults, options);

  // Assign all options keys to variables of the same name in the function scope
  var [
        height,
        margin,
        radius,
        width,
        xAxisLabelFormat,
        xAxisText,
        xMax,
        xMin,
        yAxisLabelFormat,
        yAxisText,
        yMax,
        yMin ] = Object.keys(options)
                  .sort()
                  .map( (k) => options[k] );

  var svg = d3.select('#' + graphLocationId)
    .append('svg:svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(37,40)")
    .attr('style', "-webkit-tap-highlight-color: rgba(0, 0, 0, 0);");

  var xScale = d3.scaleLinear()
        .domain(d3.extent(data, (d) => d[xKey]))
        .range([0, width])

  var yScale = d3.scaleLinear()
        .domain([yMin, yMax])
        .range([height, 0]);

  drawGrid()
  drawAxes()

  function drawAxes() {
    svg.append("g")
        .attr('class', 'axisX')
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale)
                .tickFormat(d3.format(xAxisLabelFormat))
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
          .ticks(10)
  }

  function make_y_gridlines() {
      return d3.axisLeft(yScale)
          .ticks(10)
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

  svg.append('text')
    .attr('id', 'drawYourLine')
    .attr("transform",
          "translate(" + (width/2 + 2) + " ," +
                         (height/2 - 2) + ")")
    .style('text-anchor', 'middle')
    .style("font-size", "26px")
    .text("Draw your line!");

  var guessData = data
        .map((d) => {
          return { [xKey]: d[xKey], [yKey]: d[yKey], defined: false }
        });

  var body = d3.select('svg')
  var drag = d3.drag().on("drag", dragHandler);
  body.call(drag);

  function dragHandler() {
    var coord = d3.mouse(this),
        xVal = clamp(xMin, xMax, Math.floor(xScale.invert(coord[0]) / 10) * 10),
        yVal = clamp(yMin, yMax, Math.round(yScale.invert(coord[1])*100) / 100);

    svg.select('.hoverText').remove();
    svg.select("#drawYourLine").remove();

    guessData.forEach(function(d) {
      if (Math.abs(d[xKey] - xVal) === 0) {
        d[yKey] = yVal;
        d.defined = true;
      } else if(d[xKey] < xVal && !d.defined){
        d[yKey] = yVal;
        d.defined = true;
      }
    })

    var defined = selectDefined(guessData),
        incomplete = selectIncomplete(defined),
        beforeAnswer = document.getElementById('beforeGuess-' + graphLocationId);

    if(complete(defined) && defined.length === data.length) {
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
    var id = "t" + Math.round(d[xKey]) + "-" + Math.round(d[yKey] * 100) + "-" + i;

    d3.select(this)
      .attr('fill', '#ffc700')
      .attr('r', radius + 1)

      svg.append("text")
        .attr( 'id', id)
        .attr('class', 'hoverText')
        .attr('x', () => width / 2 - 18)
        .attr('y', () => -14)
        .text(() => [d[xKey] + ': ' + (d[yKey] * 100).toFixed(1) + '%'] );
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
      var firstIncompleteX = data[guessData.length - 1][xKey];
      return [
        { [xKey]: firstIncompleteX, [yKey]: yMin, defined: true},
        { [xKey]: firstIncompleteX, [yKey]: yMax, defined: true},
        { [xKey]: xMax, [yKey]: yMax, defined: true},
        { [xKey]: xMax, [yKey]: yMin, defined: true}
      ]
    }
  }

  var scaledGuessData = guessData.map( (d) => {
    return {
      [xKey]: xScale(d[xKey]),
      [yKey]: yScale(d[yKey])
    }
  })

  function sgd() {
    drawPath(scaledGuessData)
  }

  var path = svg.append('path');

  function drawCircles(id, data, color) {
    svg.select('#' + id).remove();

    var originalRadius = id === 'answerCirclesG' ? 0 : radius;

    svg
      .append('g')
      .attr('id', 'guessCirclesG')
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

  var incompleteRange = svg.append('path');

  function drawIncompleteRange(incomplete) {
    incompleteRange
      .attr('d', incompleteRangeLine.defined(d => d.defined)(incomplete))
      .attr('class', 'incompleteRange')
  }

  function drawAnswerPath() {
    var path = svg
      .append('path')
      .data([data])
      .attr('class', 'answerLine')
      .attr('stroke-width', 2)
      .attr('d', answerLine)

    var length = path.node().getTotalLength()

    path.attr("stroke-dasharray", length + " " + length)
       .attr("stroke-dashoffset", length)
       .transition()
         .duration(2000)
         .attr("stroke-dashoffset", 0);

    drawCircles('answerCirclesG', data, 'steelblue');

    var answerText = document.getElementById('answerText-' + graphLocationId),
        beforeGuess = document.getElementById('beforeGuess-' + graphLocationId);

    answerText.classList.remove('hidden');
    beforeGuess.classList.remove('afterGuessComplete-' + graphLocationId);
    beforeGuess.classList.add('beforeGuessComplete-' + graphLocationId);
  }

  function clamp(a, b, c){
    return Math.max(a, Math.min(b, c));
  }
}

module.exports = generateGraph;
