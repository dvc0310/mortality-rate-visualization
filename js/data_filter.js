export function processLineChartData(data, cause) {
    // Create a groupedData object using d3.group
    var groupedData = d3.group(data, function(d) {
      return d.jurisdiction;
    });
  
    // Initialize allCausesData as an empty Map object
    var allCausesData = new Map();
  
    // For each item in groupedData
    groupedData.forEach(function(values, key) {
      // Create a new array that only includes items where cause_of_death is the specified cause 
      // and age_adjusted_death_rate is a valid number
      var filteredData = [];
      for (var i = 0; i < values.length; i++) {
        var d = values[i];
        if (d.cause_of_death.trim() === cause.trim() && !isNaN(d.age_adjusted_death_rate)) {
          filteredData.push(d);
        }
      }
  
      // Transform the filteredData into a new format
      var transformedData = [];
      for (var i = 0; i < filteredData.length; i++) {
        var d = filteredData[i];
        var year = Number(d.year_of_occurrence.split("-")[1]);
        transformedData.push({
          year: year,
          deaths: Number(d.age_adjusted_death_rate),
          jurisdiction: d.jurisdiction
        });
      }
  
      // Add the transformedData to allCausesData with the current jurisdiction as the key
      allCausesData.set(key, transformedData);
    });
  
    return allCausesData;
  }
  
  
export function createLineChartScales(allCausesData, width, height) {
      // Flattening array and filtering entries with valid 'deaths' data
      var flatValues = [];
      var allCausesDataValues = Array.from(allCausesData.values());
      for (var i = 0; i < allCausesDataValues.length; i++) {
          var values = allCausesDataValues[i];
          for (var j = 0; j < values.length; j++) {
              var value = values[j];
              if (!isNaN(value.deaths)) {
                  flatValues.push(value);
              }
          }
      }
  
      // Computing extent and maximum for 'year' and 'deaths'
      var yearExtent = d3.extent(flatValues, function(d) { return d.year; });
      var maxDeaths = d3.max(flatValues, function(d) { return d.deaths; });
  
      // Creating scales
      var x = d3.scaleLinear()
          .domain(yearExtent)
          .range([0, width]);
    
      var y = d3.scaleLinear()
          .domain([0, maxDeaths])
          .range([height, 0]);
  
      return { x: x, y: y };
  }
  
export function prepareChartData(data, startYear, endYear) {
    var filtered = {};

    for (var i = 0; i < data.length; i++) {
        var cur = data[i];
        var year = +cur.year_of_occurrence.split("-")[1];

        if (cur.cause_of_death == "Nephritis" || cur.cause_of_death == "COVID-19" ||
            cur.cause_of_death == "All Causes" || year < startYear || year > endYear) {
            continue;
        }
        
        if (!cur.age_adjusted_death_rate || isNaN(+cur.age_adjusted_death_rate)) {
            continue;
        }
        
        if (filtered[cur.cause_of_death]) {
            if (filtered[cur.cause_of_death].averageDeathRate[cur.jurisdiction]) {
                filtered[cur.cause_of_death].averageDeathRate[cur.jurisdiction].sum += +cur.age_adjusted_death_rate;
                filtered[cur.cause_of_death].averageDeathRate[cur.jurisdiction].count++;
            } else {
                filtered[cur.cause_of_death].averageDeathRate[cur.jurisdiction] = {
                    sum: +cur.age_adjusted_death_rate,
                    count: 1,
                };
            }
        } else {
            var newAverageDeathRate = {};
            newAverageDeathRate[cur.jurisdiction] = {
                sum: +cur.age_adjusted_death_rate,
                count: 1,
            };
            filtered[cur.cause_of_death] = {
                averageDeathRate: newAverageDeathRate
            };
        }
    }

    console.log(filtered);
    return filtered;
}


export function convertToChartData(causes) {
    var chartData = [];
    for (var cause in causes) {
        var info = causes[cause];
        var averageDeathRate = {
            "Howard County": info.averageDeathRate["Howard County"].sum / info.averageDeathRate["Howard County"].count,
            "Maryland": info.averageDeathRate["Maryland"].sum / info.averageDeathRate["Maryland"].count,
        };
        chartData.push({
            cause: cause,
            averageDeathRate: averageDeathRate
        });
    }
    return chartData;
}