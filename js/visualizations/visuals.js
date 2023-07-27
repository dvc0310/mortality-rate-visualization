import {processLineChartData, createLineChartScales, prepareChartData, convertToChartData} from "../data_filter.js";
import {drawLegend, drawLines, drawLineChartAxis} from "./line_chart_visual.js";
import {drawBarChartLegend, addYAxisLabel, drawAxis, addTitle, drawDoubleBars} from "./bar_chart_visual.js";

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


