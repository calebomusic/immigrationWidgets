var generate = require("./generateGraph.js");

document.addEventListener('DOMContentLoaded', () => {
  const data = [
                 { year: 1860, percentage: 0.132 },
                 { year: 1870, percentage: 0.144 },
                 { year: 1880, percentage: 0.133 },
                 { year: 1890, percentage: 0.148 },
                 { year: 1900, percentage: 0.136},
                 { year: 1910, percentage: 0.147 },
                 { year: 1920, percentage: 0.132 },
                 { year: 1930, percentage: 0.116 },
                 { year: 1940, percentage: 0.088 },
                 { year: 1950, percentage: 0.069 },
                 { year: 1960, percentage: 0.054 },
                 { year: 1970, percentage: 0.047},
                 { year: 1980, percentage: 0.062},
                 { year: 1990, percentage: 0.079},
                 { year: 2000, percentage: 0.111},
                 { year: 2010, percentage: 0.129}
               ];

  var options = {
    xAxisText: 'Year',
    yAxisText: 'Percentage foreign born',
    yMin: 0,
    yMax: 0.2,
    xMin: 1860,
    xMax: 2010,
    xAxisLabelFormat: 'd',
    yAxisLabelFormat: '.0%'
  };

  generate(data, 'foreignBorn', 'year', 'percentage', options)
})
