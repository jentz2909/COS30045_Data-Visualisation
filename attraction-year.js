const FILES = {
  "top-5": "data/top_5_national_parks.csv",
};

let selectedChartType = "stacked";

const radioButtons = document.getElementsByName("bar-chart-type");

const renderTop5Attraction = (data) => {
  d3.select("#top-5-chart").selectAll("*").remove();

  if (selectedChartType === "stacked") {
  } else if (selectedChartType === "percent-stacked") {
  }

  data.forEach((d) => {
    d.domestic = parseFloat(d.domestic);
    d.foreign = parseFloat(d.foreign);
    d.total = d.domestic + d.foreign;
    d.domesticPercentage = parseFloat(d.domesticPercentage);
    d.foreignPercentage = parseFloat(d.foreignPercentage);
  });

  // Set up the dimensions
  const margin = { top: 30, right: 20, bottom: 30, left: 180 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("padding", "10px")
    .style("background", "rgba(0, 0, 0, 0.6)")
    .style("border-radius", "5px")
    .style("color", "white")
    .style("text-align", "center")
    .style("font-size", "12px");

  // Append the SVG object to the body of the page
  const svg = d3
    .select("#top-5-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Create the X and Y scales
  const x = d3.scaleLinear().range([0, width]);
  const y = d3.scaleBand().rangeRound([0, height]).padding(0.3);

  // Set the domains
  if (selectedChartType === "stacked") {
    x.domain([0, d3.max(data, (d) => d.total)]);
  } else if (selectedChartType === "percent-stacked") {
    x.domain([0, 100]);
  }
  y.domain(data.map((d) => d.name));

  // Create one group per stack
  const barGroups = svg
    .selectAll(".bar-group")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "bar-group")
    .attr("transform", (d) => `translate(0,${y(d.name)})`);

  // Create the bars
  barGroups.each(function (d) {
    const group = d3.select(this);
    let domesticValue, foreignValue;
    let labelOffsetDomestic, labelOffsetForeign;

    if (selectedChartType === "stacked") {
      domesticValue = d.domestic;
      foreignValue = d.foreign;
      labelOffsetDomestic = domesticValue / 2;
      labelOffsetForeign = domesticValue + foreignValue / 2;
    } else if (selectedChartType === "percent-stacked") {
      domesticValue = d.domesticPercentage;
      foreignValue = d.foreignPercentage;
      labelOffsetDomestic = domesticValue / 2;
      labelOffsetForeign = domesticValue + foreignValue / 2;
    }

    // Domestic bar
    group
      .append("rect")
      .attr("class", "bar domestic")
      .attr("x", 0)
      .attr("height", y.bandwidth())
      .style("fill", "#4daf4a")
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(
            `Domestic: ${d.domestic}`
          )
          .style("left", event.pageX + "px")
          .style("top", event.pageY - 28 + "px");
        d3.select(event.currentTarget).style(
          "fill",
          d3.rgb("#4daf4a").darker(2)
        );
      })
      .on("mouseout", (event, d) => {
        tooltip.transition().duration(500).style("opacity", 0);
        d3.select(event.currentTarget).style("fill", "#4daf4a");
      })
      .transition()
      .duration(800)
      .attr("width", x(domesticValue));

    // Domestic label
    if (
      domesticValue > (selectedChartType === "stacked" ? d.total * 0.05 : 5)
    ) {
      group
        .append("text")
        .attr("class", "label")
        .attr("x", x(labelOffsetDomestic))
        .attr("y", y.bandwidth() / 2)
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(
          selectedChartType === "stacked"
            ? `${(d.domestic / 1000).toFixed(1)}k`
            : `${d.domesticPercentage.toFixed(1)}%`
        )
        .style("fill", "white");
    }

    // Foreign bar
    group
      .append("rect")
      .attr("class", "bar foreign")
      .attr("x", x(domesticValue))
      .attr("height", y.bandwidth())
      .style("fill", "#377eb8")
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(
            `Foreign: ${d.foreign}`
          )
          .style("left", event.pageX + "px")
          .style("top", event.pageY - 28 + "px");
        d3.select(event.currentTarget).style(
          "fill",
          d3.rgb("#377eb8").darker(2)
        );
      })
      .on("mouseout", (event, d) => {
        tooltip.transition().duration(500).style("opacity", 0);
        d3.select(event.currentTarget).style("fill", "#377eb8");
      })
      .transition()
      .duration(800)
      .attr("width", x(foreignValue));

    // Foreign label
    if (foreignValue > (selectedChartType === "stacked" ? d.total * 0.05 : 5)) {
      group
        .append("text")
        .attr("class", "label")
        .attr("x", x(labelOffsetForeign))
        .attr("y", y.bandwidth() / 2)
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(
          selectedChartType === "stacked"
            ? `${(d.foreign / 1000).toFixed(1)}k`
            : `${d.foreignPercentage.toFixed(1)}%`
        )
        .style("fill", "white");
    }
  });

  // Add the X Axis
  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0,${height})`)
    .call(
      d3
        .axisBottom(x)
        .ticks(null, selectedChartType === "stacked" ? "s" : "")
        .tickFormat(
          selectedChartType === "stacked"
            ? (d) => `${d / 1000}k`
            : (d) => d + "%"
        )
    );

  // Add the Y Axis
  svg
    .append("g")
    .attr("class", "y axis")
    .call(d3.axisLeft(y))
    .selectAll("text")
    .style("font-size", "12px");

  const legendRectSize = 18;
  const legendSpacing = 4;
  const legendElements = ["Domestic", "Foreign"];
  const legendElementWidth = legendRectSize + legendSpacing + 80;

  // Create a legend group and center it at the top
  const legend = svg
    .append("g")
    .attr("class", "legend")
    // Center the legend at the top and move it up by reducing the y translation
    .attr(
      "transform",
      `translate(${(width +
        margin.left +
        margin.right -
        legendElementWidth * legendElements.length) /
      2
      }, -30)`
    ); // Here, -10 is an arbitrary value, adjust as needed

  // Add legend items
  const legendItems = legend
    .selectAll(".legend-item")
    .data(legendElements)
    .enter()
    .append("g")
    .attr("class", "legend-item")
    .attr(
      "transform",
      (d, i) => `translate(${i * legendElementWidth}, ${legendSpacing})`
    );

  // Append rectangles to legend items
  legendItems
    .append("rect")
    .attr("x", 0) // This positions the legend squares to the right of the chart
    .attr("width", legendRectSize)
    .attr("height", legendRectSize)
    .style("fill", (d, i) => (i === 0 ? "#4daf4a" : "#377eb8"));

  // Append text to legend items
  legendItems
    .append("text")
    .attr("x", legendRectSize + legendSpacing) // Text to the right of the rectangles
    .attr("y", legendRectSize - legendSpacing)
    .attr("fill", "white")
    .style("text-anchor", "start") // Start anchor to align text to the right of the rectangle
    .text((d) => d);
};

const renderTop5Districts = (data) => {
  d3.select("#top-5-district").selectAll("*").remove();

  // Convert 'foreign' to a number and format
  data.forEach((d) => {
    d.foreign = parseFloat(d.foreign);
  });

  // Set up the dimensions
  const margin = { top: 30, right: 20, bottom: 30, left: 100 };
  const width = 600 - margin.left - margin.right;
  const height = data.length * 40; // Adjust height based on number of items

  // Append the SVG object to the body of the page
  const svg = d3
    .select("#top-5-district")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Create the X and Y scales
  const x = d3.scaleLinear().range([0, width]);
  const y = d3.scaleBand().rangeRound([0, height]).padding(0.1);

  // Set the domains
  x.domain([0, d3.max(data, (d) => d.foreign)]);
  y.domain(data.map((d) => d.district));

  // Create the bars
  svg
    .selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("y", (d) => y(d.district))
    .attr("height", y.bandwidth())
    .attr("x", 0)
    .attr("width", (d) => x(d.foreign))
    .style("fill", "#377eb8");

  // Add labels to the bars
  svg
    .selectAll(".label")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "label")
    // Adjust label position to be at the top of the bar
    .attr("y", (d) => y(d.district) + y.bandwidth() / 2)
    .attr("x", 5) // Position label at the start of the bar
    .attr("dy", ".35em")
    .attr("text-anchor", "start") // Align text to the start of the bar
    .text((d) => `${d.foreign / 1000}k`)
    .style("fill", "white"); // Change text color to black for better visibility

  // Add the X Axis
  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat((d) => `${d / 1000}k`)); // Format ticks in 'k'

  // Add the Y Axis
  svg
    .append("g")
    .attr("class", "y axis")
    .style("font-size", "12px")
    .call(d3.axisLeft(y));
};

const renderLineChart = (data) => {
  d3.select("#line-chart").selectAll("*").remove();

  // Parse the date / time
  const parseTime = d3.timeParse("%Y");

  // Format the data
  data.forEach((d) => {
    d.year = parseTime(d.year);
    d.visitors = +d.total_visitors;
  });

  console.log(data);

  // Define dimensions of the chart
  const margin = { top: 20, right: 80, bottom: 30, left: 50 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  // Set the ranges
  const x = d3.scaleTime().range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);

  // Set the color scale
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  // Define the line
  const valueline = d3
    .line()
    .x((d) => x(d.year))
    .y((d) => y(d.visitors));

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("padding", "4px")
    .style("background", "rgba(0, 0, 0, 0.7)")
    .style("border-radius", "4px")
    .style("color", "white")
    .style("text-align", "center");

  // Define the SVG canvas
  const svg = d3
    .select("#line-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Scale the range of the data
  x.domain(d3.extent(data, (d) => d.year));
  y.domain([0, d3.max(data, (d) => d.visitors)]);

  // Map the data to each district and create a new array for each one
  const districts = [...new Set(data.map((d) => d.district))];
  const districtData = districts.map((district) => {
    return data
      .filter((d) => d.district === district)
      .sort((a, b) => a.year - b.year);
  });

  // Loop through each district to draw the lines and points
  districtData.forEach((data, i) => {
    const districtColor = color(i);
    const districtGroup = svg.append("g").attr("class", `district-group-${i}`);

    // Draw the line with transition
    const linePath = districtGroup
      .append("path")
      .data([data])
      .attr("class", "line")
      .style("stroke", districtColor)
      .attr("d", valueline)
      .attr("fill", "none")
      .attr("stroke-width", "2px");

    // Create the line animation
    const totalLength = linePath.node().getTotalLength();
    linePath
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition() // Initialize a transition on the 'd' attribute of the path
      .duration(2000) // Duration of the animation
      .ease(d3.easeLinear) // Linear easing
      .attr("stroke-dashoffset", 0);

    // Draw points on the line with transition
    districtGroup
      .selectAll(`.point-${i}`)
      .data(data)
      .enter()
      .append("circle")
      .attr("class", `point point-${i}`)
      .attr("cx", (d) => x(d.year))
      .attr("cy", (d) => y(d.visitors))
      .attr("r", 0) // Initial radius of the points is zero
      .style("fill", districtColor)
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(`Year: ${d.year.getFullYear()}<br/>Visitors: ${d.visitors}`)
          .style("left", event.pageX + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", (d) => {
        tooltip.transition().duration(500).style("opacity", 0);
      })
      .transition() // Transition for the points
      .delay((d, j) => j * 100) // Delay based on the data index
      .attr("r", 3.5); // Final radius of the points

    // Add interactivity to the line
    linePath
      .on("mouseover", function () {
        d3.select(this).style("stroke-width", "5px");
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(`District: ${districts[i]}`)
          .style("left", event.pageX + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function () {
        d3.select(this).style("stroke-width", "2px");
        tooltip.transition().duration(500).style("opacity", 0);
      });
  });

  // Add the X Axis
  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  // Add the Y Axis
  svg.append("g").call(d3.axisLeft(y));

  // Draw the legend
  const legend = svg
    .selectAll(".legend")
    .data(districts)
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => `translate(0,${i * 20})`);

  legend
    .append("rect")
    .attr("x", width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", (d, i) => color(i));

  legend
    .append("text")
    .attr("x", width - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .attr("fill", "white")
    .style("text-anchor", "end")
    .text((d) => d);
};

const renderDualLineChart = (data) => {
  d3.select("#dual-line-chart").selectAll("*").remove();

  const margin = { top: 30, right: 60, bottom: 70, left: 60 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  const svg = d3.select("#dual-line-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  data.forEach(d => {
    d.year = d3.timeParse("%Y")(d.year);
    d.domestic_visitors = +d.domestic_visitors;
    d.foreign_visitors = +d.foreign_visitors;
    d.gdp_growth = +d.gdp_growth;
  });

  data.sort((a, b) => d3.ascending(a.year, b.year));

  const stackGen = d3.stack()
    .keys(["domestic_visitors", "foreign_visitors"]);
  const stackedData = stackGen(data);

  const xScale = d3.scaleBand()
    .domain(data.map(d => d.year))
    .range([0, width])
    .padding(0.1);

  const yScaleVisitors = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.domestic_visitors + d.foreign_visitors)])
    .range([height, 0]);

  const yScaleGDP = d3.scaleLinear()
    .domain(d3.extent(data, d => d.gdp_growth))
    .range([height, 0]);

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y")));

  svg.append("g")
    .call(d3.axisLeft(yScaleVisitors).tickFormat(d => `${d / 1000}k`));

  svg.append("g")
    .attr("transform", `translate(${width},0)`)
    .call(d3.axisRight(yScaleGDP));

  const barGroups = svg.selectAll(".bar-group")
    .data(stackedData)
    .enter().append("g")
    .attr("class", "bar-group")
    .style("fill", (d, i) => i === 0 ? "#1f77b4" : "#2ca02c");

  barGroups.selectAll("rect")
    .data(d => d)
    .enter().append("rect")
    .attr("x", d => xScale(d.data.year))
    .attr("y", height)  // Start from the bottom of the chart
    .attr("width", xScale.bandwidth())
    .transition()  // Adding transition
    .duration(800)  // Duration in milliseconds
    .attr("y", d => yScaleVisitors(d[1]))
    .attr("height", d => yScaleVisitors(d[0]) - yScaleVisitors(d[1]));


  barGroups.selectAll("text")
    .data(d => d)
    .enter().append("text")
    .text(d => `${((d[1] - d[0]) / 1000).toFixed(1)}k`)
    .attr("x", d => xScale(d.data.year) + xScale.bandwidth() / 2)
    .attr("y", d => yScaleVisitors(d[1]) + (yScaleVisitors(d[0]) - yScaleVisitors(d[1])) / 2)
    .attr("text-anchor", "middle")
    .attr("dy", "0.35em")
    .style("fill", "white")
    .style("font-size", "10px");

  const line = d3.line()
    .x(d => xScale(d.year) + xScale.bandwidth() / 2)
    .y(d => yScaleGDP(d.gdp_growth))
    .curve(d3.curveMonotoneX);

  svg.append("path")
    .datum(data)
    .attr("class", "line")
    .attr("d", line)
    .style("fill", "none")
    .style("stroke", "red")
    .style("stroke-width", "2px");

  svg.selectAll(".line-circle")
    .data(data)
    .enter().append("circle")
    .attr("class", "line-circle")
    .attr("cx", d => xScale(d.year) + xScale.bandwidth() / 2)
    .attr("cy", d => yScaleGDP(d.gdp_growth))
    .attr("r", 4)
    .style("fill", "red")
    .style("stroke", "none");

  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  svg.selectAll(".line-circle")
    .on("mouseover", function (event, d) {
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html("GDP Growth: " + d.gdp_growth + "%")
        .style("left", (event.pageX) + "px")
        .style("top", (event.pageY - 28) + "px");
      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", 6)
        .style("fill", "orange");
    })
    .on("mouseout", function (d) {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", 4)
        .style("fill", "red");
    });

  const pathLength = svg.select(".line").node().getTotalLength();

  svg.select(".line")
    .attr("stroke-dasharray", pathLength + " " + pathLength)
    .attr("stroke-dashoffset", pathLength)
    .transition()  // Adding transition
    .duration(2000)  // Duration in milliseconds
    .attr("stroke-dashoffset", 0);

};


const onRadioChange = (event) => {
  selectedChartType = event.target.value;
  loadCharts();
};

const loadCharts = () => {
  const data = FILES["top-5"];

  Promise.all([
    d3.csv(data),
    d3.csv("data/top_5_districts_foreign_visitors.csv"),
    d3.csv("data/yearly_visitors_by_district.csv"),
    d3.csv("data/combined_visitor_gdp_data.csv"),
  ]).then(function ([visitors, districts, yearlyVisitors, gdpVisitors]) {
    renderTop5Attraction(visitors);
    renderTop5Districts(districts);
    renderLineChart(yearlyVisitors);
    renderDualLineChart(gdpVisitors)
  });
};

radioButtons.forEach((radio) => {
  radio.addEventListener("change", onRadioChange);
});

window.addEventListener("load", loadCharts);

// https://chat.openai.com/share/e9c1c9f4-afba-46b2-8c39-55909d6f0c79
// https://chat.openai.com/share/c1ee671c-c59d-491e-8db4-43450ced74dc
// https://chat.openai.com/c/68cdd535-3e6c-4591-8b9a-c47ea372b8d2
// yearly visitor by district: https://chat.openai.com/c/6c97e719-3055-418a-9c4a-7807fe92b9e5
// https://chat.openai.com/g/g-HMNcP6w7d-data-analysis/c/2935c23f-eb6d-4ddc-bbda-0d59187bed10
// extract gdp data: https://chat.openai.com/g/g-YyyyMT9XH-chatgpt-classic/c/0d375af7-4a69-4481-b81c-0319d3ea0220
// combine gdp growth with visitor: https://chat.openai.com/g/g-HMNcP6w7d-data-analysis/c/bb38d1a6-b9b1-4afb-a4f4-3bad4c6f9e25
// https://chat.openai.com/g/g-HMNcP6w7d-data-analysis/c/53ca443f-dc5d-4df8-8efe-0a3115028879
// https://chat.openai.com/g/g-YyyyMT9XH-chatgpt-classic/c/d08357b3-e8c2-4fcd-bb3d-91bb9336bd96