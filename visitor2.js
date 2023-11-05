// Update the charts based on selected year and chart type
function updateCharts(selectedYear, chartType) {
    // Load the data from your CSV file
    d3.csv("data/visitor-arrival2.csv").then(function (data) {
        var yearData = data.find(item => item.Year == selectedYear);

        if (chartType === "pie") {
            createPieChart(yearData);
        } else {
            console.log("Error")
        }
    });
}

// Function to create a pie chart
function createPieChart(yearData) {
    // Clear any existing chart
    d3.select("#chart").html("");

    var pieData = [
        { label: "Domestic", value: yearData.Domestic },
        { label: "Foreigner", value: yearData.Foreigner }
    ];

    console.log("Do:" + yearData.Domestic)
    console.log("Fo:" + yearData.Foreigner)

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
        .innerRadius(0);

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

    // Create a container for the tooltip
    var tooltipContainer = d3.select("body")
        .append("div")
        .attr("class", "tooltip-container")
        .style("position", "absolute")
        .style("pointer-events", "none")
        .style("z-index", "10")
        .style("display", "none");

    // Create a tooltip box within the container
    var tooltipBox = tooltipContainer
        .append("div")
        .attr("class", "tooltip-box");

    svg.on("mousemove", function (event) {
        // Update the position of the tooltip container as the cursor moves
        var x = event.pageX;
        var y = event.pageY;

        tooltipContainer.style("left", (x + 10) + "px")
            .style("top", (y - 30) + "px");
    });

    arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.label))
        .style("opacity", 1) // Set initial opacity
        .style("stroke", "white")
        .style("cursor", "pointer") // Set cursor to pointer
        .on("mouseover", function (event, d) {
            // Display the tooltip container
            tooltipContainer.style("display", "block");

            // Update the content of the tooltip box
            tooltipBox.html(`<div>${d.data.label}: ${d.data.value}</div>`)
                .style("font-size", "14px");

            // Add animation for highlighting on mouseover
            d3.select(this)
                .transition()
                .duration(200)
                .attr("transform", "scale(1.1)"); // Enlarge the segment
        })
        .on("mouseout", function () {
            // Hide the tooltip container and restore the segment's size on mouseout
            tooltipContainer.style("display", "none");
            d3.select(this)
                .transition()
                .duration(200)
                .attr("transform", "scale(1)");
        });

    // Add text labels with percentages
    arcs.append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("dy", "0.35em")
        .style("text-anchor", "middle")
        .text(d => `${formatPercent(d.data.value / total)}`);

    var legend = d3.select("#chart")
        .append("div")
        .attr("class", "legend")
        .style("margin-top", "20%")
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



// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
    var yearSlider = document.getElementById("year");
    var pieChartButton = document.getElementById("pieChartButton");
    var barChartButton = document.getElementById("barChartButton");

    // Set the default chart type to "pie" when the page loads
    let currentChartType = "pie";

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
