const generateGraph = require("./generateGraph.js");
const generateNumGuessWidget = require("./generateNumGuessWidget.js");

document.addEventListener('DOMContentLoaded', () => {
  const foreignBornData = [
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

  const foreignBornOptions = {
    xAxisText: 'Year',
    yAxisText: 'Percentage foreign born',
    yMin: 0,
    yMax: 0.2,
    xMin: 1860,
    xMax: 2010,
    xAxisLabelFormat: 'd',
    yAxisLabelFormat: '.0%'
  };

  generateGraph(foreignBornData, 'foreignBorn', 'year', 'percentage', foreignBornOptions);

  // generateNumGuessWidget("foreignBornToday", '%');
  // generateNumGuessWidget("foreignBornTodayLegal", '%');

  const mexicanImmigrationData = [
    { year: 1990, population: 2.0 },
    { year: 1995, population: 2.9 },
    { year: 2000, population: 4.5 },
    { year: 2007, population: 6.9 },
    { year: 2009, population: 6.4 },
    { year: 2014, population: 5.8 }
  ];

  const otherImmigrationData = [
    { year: 1990, population: 1.5 },
    { year: 1995, population: 2.8 },
    { year: 2000, population: 4.1 },
    { year: 2007, population: 5.3 },
    { year: 2009, population: 5.0 },
    { year: 2014, population: 5.3 }
  ];

  const mexicoAndOtherOptions = {
    xAxisText: 'Year',
    yAxisText: 'Population in millions',
    yMin: 0,
    yMax: 10,
    xMin: 1990,
    xMax: 2014,
    xAxisLabelFormat: 'd',
    yAxisLabelFormat: '',
    xTicks: 6,
    yTicks: 5,
    guessDist: 2,
    otherData: [ mexicanImmigrationData ]
  };

  generateGraph(otherImmigrationData, 'mexicoAndOther', 'year', 'population', mexicoAndOtherOptions)
})
