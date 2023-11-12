// Update the charts based on selected year and chart type
function updateCharts(selectedYear, chartType) {
    // Load the data from your CSV file
    if (chartType === "pie") {
        d3.csv("data/visitor-arrival2.csv").then(function (data) {
            var yearData = data.find(item => item.Year == selectedYear);
            createPieChart(yearData);
        });
    } else if (chartType === "bar") {
        d3.csv("data/visitor-arrival.csv").then(function (data) {
            // Get data by year
            var filteredData = data.filter(function (d) {
                d.Domestic = parseInt(d.Domestic);
                d.Foreigner = parseInt(d.Foreigner);
                return d.Year === selectedYear; // Convert to integer
            });

            if (chartType === "bar") {
                // Call your bar chart creation function here
                createBarChart(filteredData);
            } else {
                console.log("Now selected: " + chartType)
            }

        });
    } else if (chartType === "chord") {
        d3.csv("data/visitor_region.csv").then(function (data) {
            // Filter data for the selected year
            var yearData = data.filter(item => item.Year == selectedYear);

            // Group the data by regions and sum the values
            var groupedData = groupDataByRegion(yearData);

            // Create a chord chart using the grouped data
            createChordChart(groupedData);

            console.log(groupedData)
        });
    }
    else {
        console.log("No found")
    }
}

// Function to group data by regions and sum the values
function groupDataByRegion(data) {

    var groupedData = {
        "Eastern Asia": 0,
        "Southern Asia": 0,
        "Southeastern Asia": 0,
        Arabs: 0,
        Europe: 0,
        Americas: 0,
        Oceania: 0,
        "Latin America": 0,
        Malaysia: 0,
        Others: 0,
        Sarawak: 0, // Initialize Sarawak with 0 value
    };
    
    // Calculate the total value of all regions
    var total = 0

    // Calculate the remaining values for other regions
    data.forEach(d => {
        groupedData["Eastern Asia"] += +d.China + +d.Japan + +d.Taiwan + +d["Hong Kong"] + +d["South Korea"];
        groupedData["Southern Asia"] += +d["Sri Lanka"] + +d.Bangladesh + +d.Pakistan + +d.India;
        groupedData["Southeastern Asia"] += +d.Singapore + +d.Brunei + +d.Philippines + +d.Thailand + +d.Indonesia;
        groupedData.Arabs += +d.Arabs;
        groupedData.Europe += +d["United Kingdom"] + +d.Germany + +d.France + +d["Nor/Swe/Den/Fin"] + +d["Belg/Lux/Net"] + +d.Russia + +d["Others Europe"];
        groupedData.Americas += +d.Canada + +d.USA;
        groupedData.Oceania += +d.Australia + +d["New Zealand"];
        groupedData["Latin America"] += +d["Latin America"];
        groupedData.Malaysia += +d["Peninsular Malaysia"] + +d.Sabah;
        groupedData.Others += +d.Others;
    });

    // Calculate the total value of all regions except Sarawak
    var total = d3.sum(Object.values(groupedData));

    // Calculate the fixed value for Sarawak (10% of the total)
    var sarawakValue = 0.1 * total;

    // Add the fixed value to Sarawak
    groupedData.Sarawak = sarawakValue;

    return groupedData;
}

function Matrix(data) {
    var regions = Object.keys(data);
    var numRegions = regions.length;

    // Calculate the total value of all regions
    var total = regions.reduce((sum, region) => sum + data[region], 0);

    // Initialize an empty matrix with zeros
    var matrix = Array.from({ length: numRegions }, () => Array(numRegions).fill(0));

    regions.forEach((region, i) => {
        matrix[i][i] = data[region]; // Set the value for the current region

        regions.forEach((otherRegion, j) => {
            if (i !== j) {
                // Calculate the value for the connection between regions
                matrix[i][j] = (0.9 * data[region] * data[otherRegion]) / (0.1 * total * (numRegions - 1));
            }
        });
    });

    console.log(matrix)

    return matrix;
}


// Function to create a pie chart
function createPieChart(yearData) {
    // Clear any existing chart
    d3.select("#chart").html("");
    d3.select("#legend").html("");

    // Set the background color to white for the chart element
    d3.select("#chart").style("background-color", null);

    var pieData = [
        { label: "Domestic", value: yearData.Domestic },
        { label: "Foreigner", value: yearData.Foreigner }
    ];

    // Calculate the total
    var total = d3.sum(pieData, d => d.value);

    // Set chart dimensions
    var width = 800;
    var height = 500;
    var radius = Math.min(width, height) / 2;

    // Format percentage values
    var formatPercent = d3.format(".2%");

    // Create a color scale for the pie chart segments
    var color = d3.scaleOrdinal()
        .domain(pieData.map(d => d.label))
        .range(["#28a745", "#007bff"]);

    // Create an SVG element
    var svg = d3.select("#chart").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Define the arc function to create pie segments
    var arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(radius - 110); // Inner radius for the doughnut effect

    // Create a pie layout
    var pie = d3.pie()
        .sort(null)
        .value(d => d.value);

    // Create the pie chart segments
    var arcs = svg.selectAll(".arc")
        .data(pie(pieData))
        .enter()
        .append("g")
        .attr("class", "arc");

    // Calculate the position for the hover text
    var textX = 0;
    var textY = 0;

    // Initialize the center text with the total sum value
    var centerText = svg.append("text")
        .attr("class", "center-text")
        .attr("transform", `translate(${textX}, ${textY})`)
        .style("font-size", "26px")
        .style("font-weight", "700")
        .style("fill", "white")
        .style("text-anchor", "middle")
        .style("dominant-baseline", "middle")

    centerText.append("tspan")
        .attr("x", textX)
        .attr("dy", "-0.7em")
        .text("Total Arrival");

    centerText.append("tspan")
        .attr("x", textX)
        .attr("dy", "1.5em")
        .text(total);

    // Update the center text with the segment's value on hover
    arcs.on("mouseover", function (event, d) {
        centerText.text("");
    })
        .on("mouseout", function () {
            centerText.append("tspan")
                .attr("x", textX)
                .attr("dy", "-0.7em")
                .text("Total Arrival");

            centerText.append("tspan")
                .attr("x", textX)
                .attr("dy", "1.5em")
                .text(total);
        });

    // Create pie chart segments
    arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.label))
        .style("stroke", "white")
        .style("cursor", "pointer")
        .on("mouseover", function (event, d) {
            // segment effect
            d3.select(this)
                .transition()
                .duration(200)
                .style("opacity", 0.8);

            // Display the label and value text in the center on separate lines
            var hoverText = svg.append("text")
                .attr("class", "hover-text")
                .attr("transform", `translate(${textX}, ${textY})`)
                .style("font-size", "26px")
                .style("font-weight", "700")
                .style("fill", "white")
                .style("text-anchor", "middle");

            hoverText.append("tspan")
                .attr("x", textX)
                .attr("dy", "-0.7em")
                .text(d.data.label);

            hoverText.append("tspan")
                .attr("x", textX)
                .attr("dy", "1.5em")
                .text(d.data.value);
        })
        .on("mouseout", function () {
            // Remove the hover text on mouseout
            svg.select(".hover-text").remove()

            // segment effect back to default
            d3.select(this)
                .transition()
                .duration(200)
                .style("opacity", 1);
        });


    // Add text labels with percentages
    arcs.append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("dy", "0.35em")
        .style("text-anchor", "middle")
        .style("font-size", "18px")
        .style('font-weight', '600')
        .text(d => `${formatPercent(d.data.value / total)}`);

    // Create legend
    var legend = d3.select("#chart")
        .append("div")
        .attr("class", "legend")
        .style("position", "absolute")
        .style("margin-top", "200px")
        .style("margin-left", '700px')
        .style("color", "white");

    var keys = legend.selectAll(".key")
        .data(pieData)
        .enter().append("div")
        .attr("class", "key")
        .style("display", "flex")
        .style("align-items", "center")
        .style("margin-right", "20px");

    keys.append("div")
        .style("height", "10px")
        .style("width", "10px")
        .style("margin", "5px 5px")
        .style("background-color", (d, i) => color(i));

    keys.append("div")
        .attr("class", "name")
        .text(d => `${d.label}`);

    keys.exit().remove();
}

// Function to create a pie chart
function createBarChart(data) {
    // Clear any existing chart
    d3.select("#chart").html("");
    d3.select("#legend").html("");

    // Set the background color to white for the chart element
    d3.select("#chart").style("background-color", "white");

    var margin = { top: 80, right: 50, bottom: 30, left: 100 };
    var width = 860 - margin.left - margin.right;
    var height = 600 - margin.top - margin.bottom;

    var svg = d3.select('#chart')
        .insert('svg', 'div')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var xScale = d3.scaleBand()
        .domain(data.map(function (d) { return d.Month; }))
        .range([0, width])
        .padding(0.05);

    // Calculate the percentage values for each category
    data.forEach(function (d) {
        d.Total = d.Domestic + d.Foreigner;
        d.Domestic = (d.Domestic / d.Total);
        d.Foreigner = (d.Foreigner / d.Total);
    });

    var yScale = d3.scaleLinear()
        .domain([0, 1]) // Set the y-axis scale to a percentage range (0-100)
        .range([height, 0]);

    var colorScale = d3.scaleOrdinal()
        .domain(["Domestic", "Foreigner"])
        .range(["#28a745", "#007bff"]);

    var stack = d3.stack()
        .keys(["Domestic", "Foreigner"]);


    var series = stack(data);

    var groups = svg.selectAll(".series")
        .data(series)
        .enter().append("g")
        .attr("class", "series")
        .style("fill", function (d) {
            return colorScale(d.key);
        });

    var tooltip = d3.select("#chart")
        .append("div")
        .attr("id", "tooltip")
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid #ddd")
        .style("padding", "5px")
        .style("display", "none");

    // Add mouseover and mousemove event handlers for the bars
    groups.selectAll("rect")
        .data(function (d) { return d; })
        .enter().append("rect")
        .attr("x", function (d) { return xScale(d.data.Month); })
        .attr("y", function (d) { return yScale(d[1]); })
        .attr("height", function (d) { return yScale(d[0]) - yScale(d[1]); })
        .attr("width", xScale.bandwidth())
        .on("mouseover", function (event, d) {
            var category = d3.select(this.parentNode).datum().key; // Get the category (Domestic or Foreigner)
            var value = d.data[category];
            var total = d.data.Total;
            var label = Math.round(d.data[category] * total);

            var tooltipText = category + ": " + label + ", " + (value * 100).toFixed(2) + "% (Total: " + total + ")";

            // Display the tooltip and update its position to follow the cursor
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px")
                .style("display", "block")
                .text(tooltipText);
        })
        .on("mousemove", function (event) {
            // Update the tooltip position to follow the cursor
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function () {
            // Hide the tooltip on mouseout
            tooltip.style("display", "none");
        });

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .call(d3.axisLeft(yScale)
            .tickFormat(d3.format(".0%"))); // Format y-axis as percentage

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -30)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("fill", "black")
        .text("Visitor Percentage by Month");

    // Create legend
    var legend = d3.select("#chart")
        .append("div")
        .attr("class", "legend")
        .style("margin-top", "40px")
        .style("color", "black");

    var keys = legend.selectAll(".key")
        .data(["Domestic", "Foreigner"])
        .enter().append("div")
        .attr("class", "key")
        .style("display", "flex")
        .style("align-items", "center")
        .style("margin-right", "20px");

    keys.append("div")
        .style("height", "10px")
        .style("width", "10px")
        .style("margin", "5px 5px")
        .style("background-color", d => colorScale(d)); // Set the background color based on the key

    keys.append("div")
        .attr("class", "name")
        .text(d => d);

    keys.exit().remove();
}

function createChordChart(data) {
    // Clear any existing chart
    d3.select("#chart").html("");
    d3.select("#legend").html("");

    // Set the background color to white for the chart element
    d3.select("#chart").style("background-color", null);

    // Get the regions and create the chord matrix
    var regions = Object.keys(data);

    // Define the width and height of the chord diagram
    var width = 800;
    var height = 800;

    // Calculate the total value of all regions except Sarawak
    var total = d3.sum(Object.values(data));

    // Calculate the fixed value for Sarawak (10% of the total excluding Sarawak)
    var sarawakValue = 0.1 * total;

    // Create an SVG element for the chord diagram
    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    // Create a chord layout
    var chords = d3.chord()
        .padAngle(0.05)
        .sortSubgroups(d3.descending)
        .sortChords(d3.ascending);

    // Create a color scale for the regions
    var colorScale = d3.scaleOrdinal()
        .domain(d3.range(regions.length))
        .range(d3.schemeCategory10);

    // Create the arcs for the regions
    var arc = d3.arc()
        .innerRadius(width / 2 * 0.35)
        .outerRadius(width / 2 * 0.4);

    // Create the ribbons connecting the regions
    var ribbon = d3.ribbon()
        .radius(width / 2 * 0.35);

    // Create a fixed arc for Sarawak
    var sarawakArc = d3.arc()
        .innerRadius(width / 2 * 0.35)
        .outerRadius(width / 2 * 0.4)
        .startAngle(0)
        .endAngle((sarawakValue / total) * 2 * Math.PI);

    // Append the fixed Sarawak arc
    svg.append("path")
        .attr("class", "arc")
        .attr("d", sarawakArc)
        .style("fill", colorScale(0)); // Set a specific color for Sarawak

    // Create groups for the arcs of other regions
    var group = svg.selectAll(".group")
        .data(chords(Matrix(data)).groups)
        .enter().append("g")
        .attr("class", "group");

    // Create the arcs for other regions
    group.append("path")
        .attr("class", "arc")
        .attr("d", arc)
        .style("fill", (d) => colorScale(d.index));

    // Create labels for the regions
    group.append("text")
        .each(function (d) { d.angle = (d.startAngle + d.endAngle) / 2; })
        .attr("dy", ".35em")
        .attr("transform", function (d) {
            return `rotate(${(d.angle * 180 / Math.PI - 90)}) ` +
                `translate(${width / 2 * 0.47}) ` +
                (d.angle > Math.PI ? "rotate(180)" : "");
        })
        .style("text-anchor", function (d) { return d.angle > Math.PI ? "end" : null; })
        .text((d) => regions[d.index]);

    // Create ribbons connecting the regions
    svg.selectAll(".chord")
        .data(chords(Matrix(data)).filter((d) => d.source.index !== 0))
        .enter().append("path")
        .attr("class", "chord")
        .attr("d", ribbon)
        .style("fill", (d) => colorScale(d.source.index))
        .style("opacity", 0.8);
}


// Declare variables in a scope accessible by all functions
var yearSlider;
var sliderTitle;
var currentChartType = "chord";

// Function to update the title with the selected year
function updateSliderTitle() {
    var selectedYear = yearSlider.value;
    sliderTitle.textContent = `Sarawak Visitor in ${selectedYear}`;
    updateCharts(selectedYear, currentChartType); // Update your chart here
}

// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
    yearSlider = document.getElementById("year"); // Define yearSlider in this scope
    var pieChartButton = document.getElementById("pieChartButton");
    var barChartButton = document.getElementById("barChartButton");
    var ChordChartButton = document.getElementById("ChordChartButton");
    sliderTitle = document.getElementById('sliderTitle');

    // Add an event listener to the slider input
    yearSlider.addEventListener('input', updateSliderTitle);

    // Initialize the charts with default year and chart type
    updateCharts(yearSlider.value, currentChartType);

    // Add event listener for the year slider
    yearSlider.addEventListener("input", function () {
        updateCharts(yearSlider.value, currentChartType);
    });

    // Add event listener for the pie chart button
    pieChartButton.addEventListener("click", function () {
        currentChartType = "pie";
        updateCharts(yearSlider.value, currentChartType);
    });

    // Add event listener for the bar chart button
    barChartButton.addEventListener("click", function () {
        currentChartType = "bar";
        updateCharts(yearSlider.value, currentChartType);
    });

    ChordChartButton.addEventListener("click", function () {
        currentChartType = "chord";
        updateCharts(yearSlider.value, currentChartType);
    });
});
