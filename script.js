// Main function to fetch data and create visualization
async function mainEvent() {
  const url = "https://opendata.howardcountymd.gov/resource/j7s2-ynf8.json";
  try {
      const response = await fetch(url);
      if (!response.ok) {
          throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      console.log(data)
      createBarChart(data);
      createLineChart(data);

  } catch (error) {
      console.error("Error fetching data:", error);
  }
}

function createBarChart(data) {
  // Prepare data for bar chart
  const causes = data.reduce((acc, cur) => {
    if(cur.cause_of_death == "All Causes"){
      return acc;
    }
    if (!cur.age_adjusted_death_rate || isNaN(+cur.age_adjusted_death_rate)) {
      return acc; // Ignore entries with missing or incorrect age_adjusted_death_rate
    }
    if (acc[cur.cause_of_death]) {
      acc[cur.cause_of_death].sum += +cur.age_adjusted_death_rate;
      acc[cur.cause_of_death].count++;
    } else {
      acc[cur.cause_of_death] = {
        sum: +cur.age_adjusted_death_rate,
        count: 1,
      };
    }
    return acc;
  }, {});

  const chartData = Object.entries(causes).map(([cause, { sum, count }]) => ({
    cause,
    averageDeathRate: sum / count,
  }));

  console.log(chartData); // Add this line to print the chartData

  // Create a mapping of long labels to shorter labels
  const labelMapping = {
    "Chronic Lower Respiratory Diseases": "CLRD",
    // Add any other mappings as needed
  };

  // Update the chartData with shorter labels
  chartData.forEach((d) => {
    if (labelMapping[d.cause]) {
      d.cause = labelMapping[d.cause];
    }
  });

  // Define chart dimensions
  const aspectRatio = 16 / 9; // You can set the desired aspect ratio here (e.g., 16:9)
  const container = document.getElementById("barchart-container");
  const containerWidth = container.clientWidth;
  const containerHeight = containerWidth / aspectRatio;

  const margin = { top: 20, right: 20, bottom: 100, left: 60 };
  const width = containerWidth - margin.left - margin.right;
  const height = containerHeight - margin.top - margin.bottom;



  // Create an SVG container
  const svg = d3
    .select("#barchart-container")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)
    
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2 - 10)
      .attr("text-anchor", "middle")
      .attr("font-size", "24px")
      .text("Average Death Rate by Cause from 2003-2020");

    svg
      .append("text")
      .attr("x", -height / 2)
      .attr("y", -margin.left / 1.5)
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("font-size", "16px")
      .text("Average Death Rate");
  // Define x and y scales
  const x = d3
    .scaleBand()
    .domain(chartData.map((d) => d.cause))
    .range([0, width])
    .padding(0.2);

  const y = d3.scaleLinear().domain([0, d3.max(chartData, (d) => d.averageDeathRate)]).range([height, 0]);

  // Draw the x-axis
  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .attr("text-anchor", "end");

  // Draw the y-axis
  svg.append("g").call(d3.axisLeft(y));

  // Draw the bars
  svg
    .selectAll(".bar")
    .data(chartData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d.cause))
    .attr("y", (d) => y(d.averageDeathRate))
    .attr("width", x.bandwidth())
    .attr("height", (d) => height - y(d.averageDeathRate))
    .attr("fill", "#69b3a2");

    svg.selectAll(".bar")
    .attr("stroke", "black")
    .attr("stroke-width", 2);

}

async function createLineChart(data) {
  // Group data by jurisdiction and filter for 'All Causes'
  const groupedData = d3.group(data, (d) => d.jurisdiction);
  const allCausesData = new Map();

  groupedData.forEach((values, key) => {
    allCausesData.set(
      key,
      values
        .filter((d) => d.cause_of_death === "All Causes")
        .map((d) => {
          const year = +d.year_of_occurrence.split("-")[1];
          return {
            year,
            deaths: +d.age_adjusted_death_rate,
          };
        })
    );
  });

  // Define chart dimensions
  const aspectRatio = 16 / 9; // You can set the desired aspect ratio here (e.g., 16:9)
  const container = document.getElementById("linechart-container");
  const containerWidth = container.clientWidth;
  const containerHeight = containerWidth / aspectRatio;

  const margin = { top: 20, right: 20, bottom: 50, left: 60 };
  const width = containerWidth - margin.left - margin.right;
  const height = 1*containerHeight - margin.top - margin.bottom;

  // Set up scales
  const x = d3
    .scaleLinear()
    .domain(
      d3.extent(
        Array.from(allCausesData.values()).flat(),
        (d) => d.year
      )
    )
    .range([0, width]);

  const y = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(
        Array.from(allCausesData.values()).flat(),
        (d) => d.deaths
      ),
    ])
    .range([height, 0]);

  // Create SVG container
  const svg = d3
    .select("#linechart-container")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Draw x axis
  const xAxis = d3.axisBottom(x).tickFormat(d3.format(".0f"));

  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis);

  // Draw y axis
  const yAxis = d3.axisLeft(y);

  svg.append("g").call(yAxis);

  // Define color scale for lines
  const color = d3.scaleOrdinal().domain(groupedData.keys()).range(["steelblue", "orange"]);

  // Draw lines
  const line = d3
    .line()
    .x((d) => x(d.year))
    .y((d) => y(d.deaths));


  // ... Rest of the createLineChart function


  // Draw chart title
  svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2 - 10)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .text("All Causes of Death By Year");

  svg
      .append("text")
      .attr("x", -height / 2)
      .attr("y", -margin.left / 1.5)
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("font-size", "12px")
      .text("Total Death Rate");

  // Draw legend
  const legend = svg
  .append("g")
  .attr("font-family", "sans-serif")
  .attr("font-size", 10)
  .attr("text-anchor", "end")
  .selectAll("g")
  .data(Array.from(allCausesData.keys()))
  .join("g")
  .attr("transform", (d, i) => `translate(0,${i * 20 - 2 * margin.top})`);

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
  

// ... Rest of the createLineChart function

    
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
      .data(values)
      .join("circle")
      .attr("class", `dot-${key}`)
      .attr("cx", (d) => x(d.year))
      .attr("cy", (d) => y(d.deaths))
      .attr("r", 3.5)
      .style("fill", color(key));
  });


  console.log(allCausesData);
}




// Add DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', async () => mainEvent());
