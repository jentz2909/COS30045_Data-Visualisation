// Update the charts based on selected year and chart type
function updateCharts(selectedYear, chartType) {
    // Load your CSV data
    d3.csv("data/Visitor_Arrival.csv").then(function (data) {
        var domesticCount = 0;
        var foreignerCount = 0;

        // console.log(data)

        data.forEach(function (d) {
            // Check if the data entry belongs to the selected year
            if (d.Year === selectedYear) {
                // Add the data for the current month to the respective count
                foreignerCount += +d.Foreigner;
                domesticCount += +d.Domestic;
            }
        });

        // Implement your chart updates here
        // You can use D3.js to create and update charts based on filteredData and chartType
        if (chartType === "pie") {
            createPieChart(foreignerCount, domesticCount);
        } else if (chartType === "bar") {
            // Call your bar chart creation function here
            createBarChart(foreignerCount, domesticCount);
        }

        // console.log(foreignerCount)
    });
}

// Create pie chart
function createPieChart(foreignerCount, domesticCount) {
    // Clear any existing chart
    d3.select("#chart").html("");

    // Set chart dimensions
    const width = 800;
    const height = 500;

    // Define outer and inner radius for the pie chart
    const outerRadius = Math.min(width, height) / 2 - 10;
    const innerRadius = 0;

    // Define color scale for pie chart slices
    const color = d3.scaleOrdinal(["#28a745", "#007bff"]);

    // Format percentage values
    const formatPercent = d3.format(".2%");

    // Calculate the total count of visitors
    const total = foreignerCount + domesticCount;

    // Define data for the pie chart
    const data = [
        { label: "Domestic", value: domesticCount },
        { label: "Foreign", value: foreignerCount }
    ];

    // Create a pie layout and arc generator
    const pie = d3.pie().sort(null).value(d => d.value);
    const arc = d3.arc().outerRadius(outerRadius).innerRadius(innerRadius);

    // Create an SVG element for the pie chart
    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    // Create pie slices
    const arcs = svg.selectAll(".arc")
        .data(pie(data))
        .enter()
        .append("g")
        .attr("class", "arc");

    // Add pie slices with mouseover functionality
    arcs.append("path")
        .attr("d", arc)
        .style("fill", (d, i) => color(i));
    // Add text labels with percentages
    arcs.append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("dy", "0.35em")
        .style("text-anchor", "middle")
        .text(d => `${formatPercent(d.data.value / total)}`);

    // Create legends
    // Create a legend
    var legend = d3.select("#legend")
        .selectAll(".key")
        .data(data)
        .enter().append("div")
        .attr("class", "key mb-2 d-flex align-items-center");

    legend.append("div")
        .attr("class", "symbol")
        .style("height", "10px")
        .style("width", "10px")
        .style("margin", "5px 5px")
        .style("background-color", (d, i) => color(i));

    legend.append("div")
        .attr("class", "name")
        .text(d => d.label);

}



function createBarChart(foreignerCount, domesticCount) {

}


// Rest of your code for bar chart, data loading, and event handling

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
