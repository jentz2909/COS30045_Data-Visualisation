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
    } else {
        console.log("No found")
    }
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

            var tooltipText = category + ": " + label + ", " + (value*100).toFixed(2) + "% (Total: " + total + ")";

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


// Declare variables in a scope accessible by all functions
var yearSlider;
var sliderTitle;
var currentChartType = "bar";

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
});
