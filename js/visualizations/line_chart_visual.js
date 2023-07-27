export function drawLineChartAxis(svg, x, y, width, height) {
    const xAxis = d3.axisBottom(x).tickFormat(d3.format(".0f"));
    const yAxis = d3.axisLeft(y);
  
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis);
  
    svg.append("g").call(yAxis);
}
  
export function drawLines(svg, allCausesData, x, y, width, height) {
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

export function drawLegend(svg, allCausesData, width, margin) {
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