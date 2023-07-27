export function drawBarChartLegend(svg, width, margin) {
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

export function drawAxis(svg, x, y, width, height) {
    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .attr("text-anchor", "end");
  
    svg.append("g").call(d3.axisLeft(y));
}
  
export function drawDoubleBars(svg, chartData, x0, x1, y, height) {
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

export function addYAxisLabel(svg, height, margin, text) {
    svg
      .append("text")
      .attr("x", -height / 2)
      .attr("y", -margin.left / 1.5)
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("font-size", "16px")
      .text(text);
}

export function addTitle(svg, width, text) {
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .attr("font-size", "24px")
      .text(text);
}
  