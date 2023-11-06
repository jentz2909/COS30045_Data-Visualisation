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
                // Filter the data for the selected year
                return d.Year === selectedYear;
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


// Function to toggle between stacked and percentage stacked bar chart
function toggleChartType() {
    const selectedYear = document.getElementById("year").value;
    const chartTypeRadio = document.querySelector('input[name="chartType"]:checked').value;
    updateCharts(selectedYear, chartTypeRadio);
}


function createBarChart(data) {
    // Clear any existing chart
    d3.select("#chart").html("");
    d3.select("#legend").html("");

    // Set the background color to white for the chart element
    d3.select("#chart").style("background-color", 'white');

    var margin = { top: 20, right: 120, bottom: 50, left: 120 };
    var width = 960 - margin.left - margin.right;
    var height = 520 - margin.top - margin.bottom;

    var svg = d3.select('#chart')
        .insert('svg', 'div')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Define a color scale for different data categories
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    // Create x and y scales
    var xScale = d3.scaleBand()
        .domain(data.map(function (d) { return d.Month; }))
        .range([0, width])
        .padding(0.1);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) { return d.Foreigner + d.Domestic; })])
        .range([height, 0]);

    // Create x and y axes
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    // Append the x and y axes to the SVG
    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

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
