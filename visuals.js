export function createBarChart(data, startYear, endYear) {
  const causes = prepareChartData(data, startYear, endYear);
  const chartData = convertToChartData(causes);

  console.log(chartData);

  const aspectRatio = 16 / 9;
  const margin = { top: 20, right: 20, bottom: 100, left: 60 };
  const dimensions = getChartDimensions("barchart-container", aspectRatio, margin);
  const { containerWidth, containerHeight, width, height } = dimensions;

  const svg = createSvg("barchart-container", containerWidth, containerHeight, margin);
  addTitle(svg, width, "\n\n");
  addYAxisLabel(svg, height, margin, "Average Death Rate");

  const x0 = d3.scaleBand().domain(chartData.map((d) => d.cause)).range([0, width]).paddingInner(0.2);
  const x1 = d3.scaleBand().domain(["Howard County", "Maryland"]).range([0, x0.bandwidth()]).padding(0.05);
  const y = d3.scaleLinear().domain([0, d3.max(chartData, (d) => Math.max(d.averageDeathRate["Howard County"], d.averageDeathRate["Maryland"]))]).range([height, 0]);

  drawAxis(svg, x0, y, width, height);
  drawDoubleBars(svg, chartData, x0, x1, y, height);
  drawBarChartLegend(svg, width, margin);
  
}


export async function createLineChart(data, cause) {
  const allCausesData = processLineChartData(data, cause);
  const aspectRatio = 16 / 9;
  const margin = { top: 20, right: 20, bottom: 100, left: 60 };
  const dimensions = getChartDimensions("linechart-container", aspectRatio, margin);
  const { containerWidth, containerHeight, width, height } = dimensions;

  const { x, y } = createLineChartScales(allCausesData, width, height);
  const svg = createSvg("linechart-container", containerWidth, containerHeight, margin);

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", -margin.top / 2)
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .text("\n\n\n\n");

  svg
    .append("text")
    .attr("x", -height / 2)
    .attr("y", -margin.left / 1.5)
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("font-size", "12px")
    .text("Total Death Rate");

  drawLineChartAxis(svg, x, y, width, height);
  drawLines(svg, allCausesData, x, y, width, height);
  drawLegend(svg, allCausesData, width, margin);
}


/* --------------------------------HELPER FUNCTIONS-------------------------------- */


function processLineChartData(data, cause) {
  const groupedData = d3.group(data, (d) => d.jurisdiction);
  const allCausesData = new Map();

  groupedData.forEach((values, key) => {
    allCausesData.set(
      key,
      values
        .filter((d) => d.cause_of_death.trim() === cause.trim() && !isNaN(d.age_adjusted_death_rate))
        .map((d) => {
          const year = +d.year_of_occurrence.split("-")[1];
          return {
            year,
            deaths: +d.age_adjusted_death_rate,
            jurisdiction: d.jurisdiction,
          };
        })
    );
  });

  return allCausesData;
}

function createLineChartScales(allCausesData, width, height) {
  const x = d3
    .scaleLinear()
    .domain(
      d3.extent(
        Array.from(allCausesData.values())
          .flat()
          .filter((d) => !isNaN(d.deaths)),
        (d) => d.year
      )
    )
    .range([0, width]);

  const y = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(
        Array.from(allCausesData.values())
          .flat()
          .filter((d) => !isNaN(d.deaths)),
        (d) => d.deaths
      ),
    ])
    .range([height, 0]);
  return { x, y }
}

function drawLineChartAxis(svg, x, y, width, height) {
  const xAxis = d3.axisBottom(x).tickFormat(d3.format(".0f"));
  const yAxis = d3.axisLeft(y);

  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis);

  svg.append("g").call(yAxis);
}

function drawLines(svg, allCausesData, x, y, width, height) {
  console.log(allCausesData);
  const color = d3
    .scaleOrdinal()
    .domain(allCausesData.keys())
    .range(["steelblue", "orange"]);

  const line = d3
    .line()
    .defined((d) => !isNaN(d.deaths)) // Skip data points with NaN value
    .x((d) => x(d.year))
    .y((d) => y(d.deaths));

  allCausesData.forEach((values, key) => {
    svg
      .append("path")
      .datum(values)
      .attr("fill", "none")
      .attr("stroke", color(key))
      .attr("stroke-width", 2)
      .attr("d", line);

    // Draw dots
    svg
      .selectAll(`.dot-${key}`)
      .data(values.filter((d) => !isNaN(d.year))) // filter out the data with NaN years
      .join("circle")
      .attr("class", `dot-${key}`)
      .attr("cx", (d) => x(d.year))
      .attr("cy", (d) => y(d.deaths))
      .attr("r", 3.5)
      .style("fill", color(key));
  });
}

function drawBarChartLegend(svg, width, margin) {
  const jurisdictions = ["Howard County", "Maryland"];
  const colors = ["#69b3a2", "#407294"];

  const legend = svg
    .append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .attr("text-anchor", "end")
    .selectAll("g")
    .data(jurisdictions)
    .join("g")
    .attr("transform", (d, i) => `translate(0,${i * 20 -  margin.top})`);

  legend
    .append("rect")
    .attr("x", width - 19)
    .attr("width", 19)
    .attr("height", 10)
    .attr("fill", (d, i) => colors[i]);

  legend
    .append("text")
    .attr("x", width - 24)
    .attr("y", 4)
    .attr("dy", "0.32em")
    .text((d) => d);
}


function drawLegend(svg, allCausesData, width, margin) {
  const color = d3.scaleOrdinal().domain(allCausesData.keys()).range(["steelblue", "orange"]);

  const legend = svg
    .append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .attr("text-anchor", "end")
    .selectAll("g")
    .data(Array.from(allCausesData.keys()))
    .join("g")
    .attr("transform", (d, i) => `translate(0,${i * 20 - 1 * margin.top})`);

  legend
    .append("rect")
    .attr("x", width - 19)
    .attr("width", 19)
    .attr("height", 10)
    .attr("fill", color);

  legend
    .append("text")
    .attr("x", width - 24)
    .attr("y", 4)
    .attr("dy", "0.32em")
    .text((d) => d);
}


function getChartDimensions(containerId, aspectRatio, margin) {
  const container = document.getElementById(containerId);
  const containerWidth = container.clientWidth;
  const containerHeight = containerWidth / aspectRatio;

  const width = containerWidth - margin.left - margin.right;
  const height = containerHeight - margin.top - margin.bottom;

  return {
    containerWidth,
    containerHeight,
    width,
    height,
  };
}

function createSvg(containerId, containerWidth, containerHeight, margin) {
  return d3
    .select(`#${containerId}`)
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
}

function addTitle(svg, width, text) {
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .attr("font-size", "24px")
    .text(text);
}

function addYAxisLabel(svg, height, margin, text) {
  svg
    .append("text")
    .attr("x", -height / 2)
    .attr("y", -margin.left / 1.5)
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("font-size", "16px")
    .text(text);
}

function drawAxis(svg, x, y, width, height) {
  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .attr("text-anchor", "end");

  svg.append("g").call(d3.axisLeft(y));
}

function drawDoubleBars(svg, chartData, x0, x1, y, height) {
  const color = d3.scaleOrdinal().domain(["Howard County", "Maryland"]).range(["#69b3a2", "#407294"]);

  svg
    .append("g")
    .selectAll("g")
    .data(chartData)
    .join("g")
    .attr("transform", d => `translate(${x0(d.cause)}, 0)`)
    .selectAll("rect")
    .data(d => ["Howard County", "Maryland"].map(jurisdiction => ({ jurisdiction, value: d.averageDeathRate[jurisdiction] })))
    .join("rect")
    .attr("x", d => x1(d.jurisdiction))
    .attr("y", d => y(d.value))
    .attr("width", x1.bandwidth())
    .attr("height", d => height - y(d.value))
    .attr("fill", d => color(d.jurisdiction))
    .attr("stroke", "black")
    .attr("stroke-width", 1);
}

function prepareChartData(data, startYear, endYear) {
  const filtered = data.reduce((acc, cur) => {
    const year = +cur.year_of_occurrence.split("-")[1];
    if (cur.cause_of_death == "Nephritis" ||
      cur.cause_of_death == "COVID-19" ||
      cur.cause_of_death == "All Causes" ||
      year < startYear || year > endYear) {
      return acc;
    }
    if (!cur.age_adjusted_death_rate || isNaN(+cur.age_adjusted_death_rate)) {
      return acc;
    }
    if (acc[cur.cause_of_death]) {
      if (acc[cur.cause_of_death].averageDeathRate[cur.jurisdiction]) {
        acc[cur.cause_of_death].averageDeathRate[cur.jurisdiction].sum += +cur.age_adjusted_death_rate;
        acc[cur.cause_of_death].averageDeathRate[cur.jurisdiction].count++;
      } else {
        acc[cur.cause_of_death].averageDeathRate[cur.jurisdiction] = {
          sum: +cur.age_adjusted_death_rate,
          count: 1,
        };
      }
    } else {
      acc[cur.cause_of_death] = {
        averageDeathRate: {
          [cur.jurisdiction]: {
            sum: +cur.age_adjusted_death_rate,
            count: 1,
          },
        },
      };
    }
    return acc;
  }, {});

  console.log(filtered);
  return filtered;
}

function convertToChartData(causes) {
  return Object.entries(causes).map(([cause, { averageDeathRate }]) => ({
    cause,
    averageDeathRate: {
      "Howard County": averageDeathRate["Howard County"].sum / averageDeathRate["Howard County"].count,
      "Maryland": averageDeathRate["Maryland"].sum / averageDeathRate["Maryland"].count,
    },
  }));
}


