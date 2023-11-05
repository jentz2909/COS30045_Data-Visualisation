// Update the charts based on selected year and chart type
function updateCharts(selectedYear, chartType) {
    // Load your CSV data
    d3.csv("data/visitor-arrival.csv").then(function (data) {
        var domesticCount = 0;
        var foreignerCount = 0;

        // console.log(data)

        // Calculate the total number of each year
        data.forEach(function (d) {
            // Check if the data entry belongs to the selected year
            if (d.Year === selectedYear) {
                // Add the data for the current month to the respective count
                foreignerCount += +d.Foreigner;
                domesticCount += +d.Domestic;
            }
        });

        // Get data by year
        var filteredData = data.filter(function (d) {
            // Filter the data for the selected year
            return d.Year === selectedYear;
        });

        // Implement your chart updates here
        // You can use D3.js to create and update charts based on filteredData and chartType
        if (chartType === "pie") {
            createPieChart(foreignerCount, domesticCount);
        } else if (chartType === "bar") {
            // Call your bar chart creation function here
            createBarChart(filteredData);
        }

        // console.log(foreignerCount)
    });
}

// Create pie chart
function createPieChart(foreignerCount, domesticCount) {
    // Clear any existing chart
    d3.select("#chart").html("");
    d3.select("#legend").html("");
    d3.select("#chart").style("background-color", null);

    // Set chart dimensions
    var width = 800;
    var height = 500;

    // Define outer and inner radius for the pie chart
    var outerRadius = Math.min(width, height) / 2 - 10;
    var innerRadius = 0;

    // Define color scale for pie chart slices
    var color = d3.scaleOrdinal(["#28a745", "#007bff"]);

    // Format percentage values
    var formatPercent = d3.format(".2%");

    // Calculate the total count of visitors
    var total = foreignerCount + domesticCount;

    // Define data for the pie chart
    var data = [
        { label: "Domestic", value: domesticCount },
        { label: "Foreign", value: foreignerCount }
    ];

    // Create a pie layout and arc generator
    var pie = d3.pie()
        .sort(null)
        .value(d => d.value);

    var arc = d3.arc()
        .outerRadius(outerRadius)
        .innerRadius(innerRadius);

    // Create an SVG element for the pie chart
    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    // Create pie slices
    var arcs = svg.selectAll(".arc")
        .data(pie(data))
        .enter()
        .append("g")
        .attr("class", "arc");

    arcs.append("path")
        .attr("d", arc)
        .style("fill", (d, i) => color(i))
        .on("mouseover", function (d) {
            // Create a tooltip div
            d3.select("#chart").append("div")
                .attr("class", "tooltip")
                .html(d.data.label + ": " + d.data.value) // Display the label and value
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 30) + "px");
        })
        .on("mouseout", function () {
            // Remove the tooltip when mouseout
            d3.select(".tooltip").remove();
        });

    // Add text labels with percentages
    arcs.append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("dy", "0.35em")
        .style("text-anchor", "middle")
        .text(d => `${formatPercent(d.data.value / total)}`);

    // Create legend
    var legend = d3.select("#legend")
        .selectAll(".key")
        .data(data)
        .enter().append("div")
        .attr("class", "key mb-2 d-flex align-items-center");

    legend.append("div")
        .style("height", "10px")
        .style("width", "10px")
        .style("margin", "5px 5px")
        .style("background-color", (d, i) => color(i));

    legend.append("div")
        .attr("class", "name")
        .text(d => d.label);
}

// Create a bar chart
function createBarChart(data) {
    // Clear any existing chart
    d3.select("#chart").html("");
    d3.select("#legend").html("");

    // Set the background color to white for the chart element
    d3.select("#chart").style("background-color", "white");

    // Define the dimensions of the chart
    var margin = { top: 60, right: 20, bottom: 40, left: 60 };
    var width = 800 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;

    // Create an SVG element for the chart
    var svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Define x and y scales
    var x = d3.scaleBand()
        .domain(data.map(function (d) { return d.Month; }))
        .range([0, width])
        .padding(0.1);

    var y = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) { return Math.max(d.Foreigner, d.Domestic); })])
        .nice()
        .range([height, 0]);

    // Create groups for domestic and foreign data
    var groups = svg.selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("transform", function (d) { return "translate(" + x(d.Month) + ",0)"; });

    // Create bars for domestic visitors
    groups.append("rect")
        .attr("x", 0)
        .attr("y", function (d) { return y(d.Domestic); })
        .attr("width", x.bandwidth() / 2)
        .attr("height", function (d) { return height - y(d.Domestic); })
        .style("fill", "#28a745")
        .on("mouseover", function (event, d) {
            // Show the total number as a tooltip on mouseover
            var total = d.Domestic + d.Foreigner;
            var tooltipText = "Total: " + total;

            // Get mouse coordinates
            var [x, y] = d3.pointer(event);

            // Create or update the tooltip
            var tooltip = d3.select("#chart").select(".tooltip");
            if (tooltip.empty()) {
                tooltip = d3.select("#chart")
                    .append("div")
                    .attr("class", "tooltip")
                    .html(tooltipText);
            } else {
                tooltip.html(tooltipText);
            }

            // Set the tooltip's position relative to the mouse cursor
            tooltip.style("left", (x + 10) + "px")
                .style("top", (y - 25) + "px")
                .style("display", "block");
        })
        .on("mouseout", function () {
            // Hide the tooltip on mouseout
            d3.select(".tooltip").style("display", "none");
        });

    // Create bars for foreign visitors
    groups.append("rect")
        .attr("x", x.bandwidth() / 2)
        .attr("y", function (d) { return y(d.Foreigner); })
        .attr("width", x.bandwidth() / 2)
        .attr("height", function (d) { return height - y(d.Foreigner); })
        .style("fill", "#007bff")
        .on("mouseover", function (event, d) {
            // Show the total number as a tooltip on mouseover
            var total = d.Domestic + d.Foreigner;
            var tooltipText = "Total: " + total;

            // Get mouse coordinates
            var [x, y] = d3.pointer(event);

            // Create or update the tooltip
            var tooltip = d3.select("#chart").select(".tooltip");
            if (tooltip.empty()) {
                tooltip = d3.select("#chart")
                    .append("div")
                    .attr("class", "tooltip")
                    .html(tooltipText);
            } else {
                tooltip.html(tooltipText);
            }

            // Set the tooltip's position relative to the mouse cursor
            tooltip.style("left", (x + 10) + "px")
                .style("top", (y - 25) + "px")
                .style("display", "block");
        })
        .on("mouseout", function () {
            // Hide the tooltip on mouseout
            d3.select(".tooltip").style("display", "none");
        });



    // Add X axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add Y axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add a title for the chart
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -30) // Adjust the vertical position of the title
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("fill", "black") // Set the title text color
        .text("Visitor Counts by Month");

    // Define a color scale for the legend
    var color = d3.scaleOrdinal()
        .domain(["Domestic", "Foreign"])
        .range(["#28a745", "#007bff"]); // Adjust the legend colors as needed

    // Create legend for the group bar chart
    var legend = d3.select("#legend")
        .selectAll(".key")
        .data(["Domestic", "Foreign"])
        .enter()
        .append("div")
        .attr("class", "key mb-2 d-flex align-items-center");

    legend.append("div")
        .style("height", "10px")
        .style("width", "10px")
        .style("margin", "5px 5px")
        .style("background-color", (d, i) => color(d));

    legend.append("div")
        .attr("class", "name")
        .text(d => d);

}

// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
    var yearSlider = document.getElementById("year");
    var pieChartButton = document.getElementById("pieChartButton");
    var barChartButton = document.getElementById("barChartButton");

    // Set the default chart type to "pie" when the page loads
    let currentChartType = "bar";

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
