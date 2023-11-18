// Update the charts based on selected year and chart type
function updateCharts(selectedYear, chartType) {
    // Load the data from CSV file
    if (chartType === "pie") {
        d3.csv("data/visitor_arrival.csv").then(function (data) {
            var yearData = data.filter(item => item.Year == selectedYear);
            createPieChart(yearData);
            showYearSlider()
        });
    }
    else if (chartType === "bar") {
        d3.csv("data/visitor_arrival.csv").then(function (data) {
            // Get data by year
            var filteredData = data.filter(function (d) {
                d.Domestic = parseInt(d.Domestic); // Convert to integer
                d.Foreign = parseInt(d.Foreign); // Convert to integer
                return d.Year === selectedYear; // Return selected year value
            });

            createBarChart(filteredData);
            showYearSlider()
        });
    }
    else if (chartType === "line") {
        d3.csv("data/visitor_arrival.csv").then(function (data) {

            // Extract unique years from the dataset
            var years = Array.from(new Set(data.map(item => item.Year)));

            // Extract data for all years
            var yearData = {};
            years.forEach(year => {
                yearData[year] = data.filter(item => item.Year == year);
            });

            createLineChart(yearData)

            console.log(yearData)


            hideYearSlider(); // Show the year slider
        });
    }
    else if (chartType === "chord") {
        d3.csv("data/visitor_region.csv").then(function (data) {
            // Filter data for the selected year
            var yearData = data.filter(item => item.Year == selectedYear);

            // Create a chord chart using the grouped data
            createChordChart(groupDataByRegion(yearData));
            showYearSlider()

            console.log(groupDataByRegion(yearData))
        });
    }
    else {
        console.log("No found")
    }
}



// Function to group data by regions and sum the values
function groupDataByRegion(data) {
    var regionMapping = {
        "Eastern Asia": ["China", "Japan", "Taiwan", "Hong Kong", "South Korea"],
        "Southern Asia": ["Sri Lanka", "Bangladesh", "Pakistan", "India"],
        "Southeastern Asia": ["Singapore", "Brunei", "Philippines", "Thailand", "Indonesia"],
        "Europe": ["United Kingdom", "Germany", "France", "Nor/Swe/Den/Fin", "Belg/Lux/Net", "Russia", "Others Europe"],
        "Americas": ["Canada", "USA", "Latin America", "Latin America"],
        "Oceania": ["Australia", "New Zealand"],
        "Malaysia": ["Peninsular Malaysia", "Sabah"],
        "Others": ["Others", "Arabs"],
    };

    var groupedData = {
        Sarawak: 0, // Initialize Sarawak with 0 value
    };

    // Calculate the total value of all regions
    var total = 0;

    // Iterate through the data and sum the values for each region
    data.forEach(d => {
        Object.keys(regionMapping).forEach(region => {
            var columns = regionMapping[region];
            var regionTotal = columns.reduce((sum, columnName) => sum + (+d[columnName] || 0), 0);
            groupedData[region] = (groupedData[region] || 0) + regionTotal;
        });
    });

    // Calculate the fixed value for Sarawak (10% of the total)
    total = d3.sum(Object.values(groupedData));
    var sarawakValue = 0.1 * total;

    // Add the fixed value to Sarawak
    groupedData.Sarawak = Math.round(sarawakValue);

    console.log("hahaha",groupedData)

    return groupedData;
}

function Matrix(data) {
    var regions = Object.keys(data);
    var numRegions = regions.length;

    console.log("regiondkwhatdata", data)

    // Calculate the total value of all regions
    var total = regions.reduce((sum, region) => sum + data[region], 0);

    // Initialize an empty matrix with zeros
    var matrix = Array.from({ length: numRegions }, () => Array(numRegions).fill(0));

    regions.forEach((region, i) => {
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

    // Clear any existing legend
    d3.select("#chart").html("");
    d3.select("#legend").html("");

    // Convert values to numbers and sum for each category (Domestic and Foreign)
    var totalDomestic = d3.sum(yearData, d => +d.Domestic || 0);
    var totalForeign = d3.sum(yearData, d => +d.Foreign || 0);

    // Create a new data structure with the summed values
    var pieData = [
        { label: "Domestic", value: totalDomestic },
        { label: "Foreign", value: totalForeign }
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
        .style("fill", "white")
        .style("pointer-events", "none")
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
    // Clear any existing legend
    d3.select("#chart").html("");
    d3.select("#legend").html("");

    var margin = { top: 80, right: 50, bottom: 30, left: 100 };
    var width = 800 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;

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
        d.Total = d.Domestic + d.Foreign;
        d.Domestic = (d.Domestic / d.Total);
        d.Foreign = (d.Foreign / d.Total);
    });

    var yScale = d3.scaleLinear()
        .domain([0, 1]) // Set the y-axis scale to a percentage range (0-100)
        .range([height, 0]);

    var colorScale = d3.scaleOrdinal()
        .domain(["Domestic", "Foreign"])
        .range(["#28a745", "#007bff"]);

    var stack = d3.stack()
        .keys(["Domestic", "Foreign"]);


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
            var category = d3.select(this.parentNode).datum().key; // Get the category (Domestic or Foreign)
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

    // Change the color of the entire axis (ticks, tick text, and axis line) to white
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .style("fill", "white") // X-axis text color
        .selectAll(".tick line")
        .style("stroke", "white"); // X-axis tick lines color

    svg.append("g")
        .call(d3.axisLeft(yScale)
            .tickFormat(d3.format(".0%"))) // Format y-axis as percentage
        .selectAll("text")
        .style("fill", "white") // Y-axis text color
        .selectAll(".tick line")
        .style("stroke", "white"); // Y-axis tick lines color

    // Change the color of the axis lines to white
    svg.selectAll(".domain")
        .style("stroke", "white"); // Axis line color

    // Change the color of the tick lines that point at the axis values to white
    svg.selectAll(".tick line")
        .style("stroke", "white"); // Tick lines color


    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -30)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("fill", "white")
        .text("Visitor Arrival Over the Months");

    // Create legend
    var legend = d3.select("#chart")
        .append("div")
        .attr("class", "legend")
        .style("margin-top", "100px")
        .style("color", "white");

    var keys = legend.selectAll(".key")
        .data(["Domestic", "Foreign"])
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

// Function to create a line chart
function createLineChart(yearData) {
    // Clear any existing chart
    d3.select("#chart").html("");
    d3.select("#legend").html("");

    // Set the dimensions of the chart
    var margin = { top: 100, right: 100, bottom: 30, left: 100 };
    var width = 800 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;

    // Create an SVG element
    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Create a color scale for lines and dots
    var colorScale = d3.scaleOrdinal()
        .domain(["Domestic", "Foreign"])
        .range(["#28a745", "#007bff"]);

    // Extract unique years from the dataset
    var years = Object.keys(yearData);

    // Create an array to store the data for each year
    var yearDataArray = years.map(function (year) {
        return {
            year: year,
            data: yearData[year]
        };
    });

    // Define scales for x and y axes
    var x = d3.scaleBand()
        .domain(years)
        .range([0, width])
        .padding(0.1);

    var y = d3.scaleLinear()
        .domain([0, d3.max(yearDataArray, function (d) {
            return d3.max(d.data, function (entry) {
                return Math.max(parseInt(entry.Foreign), parseInt(entry.Domestic));
            });
        })])
        .nice()
        .range([height, 0]);

    // Calculate the total of "Foreign" and "Domestic" for each year
    var yearTotals = years.map(function (year) {
        var ForeignTotal = d3.sum(yearData[year], function (d) {
            return parseInt(d.Foreign);
        });

        var domesticTotal = d3.sum(yearData[year], function (d) {
            return parseInt(d.Domestic);
        });

        return {
            year: year,
            ForeignTotal: ForeignTotal,
            domesticTotal: domesticTotal
        };
    });

    // Create an array of years for the x-axis
    var yearsArray = yearTotals.map(function (total) {
        return total.year;
    });

    // Create scales for x and y axes
    var x = d3.scaleBand()
        .domain(yearsArray)
        .range([0, width])
        .padding(0.1);

    var y = d3.scaleLinear()
        .domain([0, d3.max(yearTotals, function (total) {
            return Math.max(total.ForeignTotal, total.domesticTotal);
        })])
        .nice()
        .range([height, 0]);

    // Define line generators for Foreign and domestic data
    var lineForeign = d3.line()
        .x(function (d) { return x(d.year) + x.bandwidth() / 2; })
        .y(function (d) { return y(d.ForeignTotal); });

    var lineDomestic = d3.line()
        .x(function (d) { return x(d.year) + x.bandwidth() / 2; })
        .y(function (d) { return y(d.domesticTotal); });

    // Define a tooltip element
    var tooltip = d3.select("#chart")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("color", "white")
        .style("user-select", "none");

    // Add lines for Foreign data
    svg.selectAll(".line-Foreign")
        .data([yearTotals])
        .enter()
        .append("path")
        .attr("class", "line-Foreign")
        .attr("d", function (d) {
            return lineForeign(d);
        })
        .style("fill", "none")
        .style("stroke-width", 2)
        .style("stroke", colorScale("Foreign")) // Set line color
        .on("mouseover", function () {
            // Show tooltip-like text on hover for "Foreign" line
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltip.html("<strong>Line: Foreign</strong>")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 30) + "px");
        })
        .on("mousemove", function (event) {
            // Move tooltip-like text with the cursor
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 30) + "px");
        })
        .on("mouseout", function () {
            // Hide tooltip-like text on mouseout for "Foreign" line
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Add lines for domestic data
    svg.selectAll(".line-domestic")
        .data([yearTotals])
        .enter()
        .append("path")
        .attr("class", "line-domestic")
        .attr("d", function (d) {
            return lineDomestic(d);
        })
        .style("fill", "none")
        .style("stroke-width", 2)
        .style("stroke", colorScale("Domestic")) // Set line color
        .on("mouseover", function () {
            // Show tooltip-like text on hover for "Domestic" line
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltip.html("<strong>Line: Domestic</strong>")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 30) + "px");
        })
        .on("mousemove", function (event) {
            // Move tooltip-like text with the cursor
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 30) + "px");
        })
        .on("mouseout", function () {
            // Hide tooltip-like text on mouseout for "Domestic" line
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });


    // Add dots for each year's foreign data
    svg.selectAll(".dot-foreign")
        .data(yearTotals)
        .enter()
        .append("circle")
        .attr("class", "dot-foreign")
        .attr("cx", function (d) { return x(d.year) + x.bandwidth() / 2; })
        .attr("cy", function (d) { return y(d.ForeignTotal); })
        .attr("r", 5) // Set dot radius
        .style("fill", colorScale("Foreign")) // Set dot color
        .on("mouseover", function (event, d) {
            // Show tooltip on hover for the "Foreign" dot
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltip.html("<strong>Year: " + d.year + "<br>Foreign: " + d.ForeignTotal + "</strong>")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 30) + "px");
        })
        .on("mousemove", function (event) {
            // Move tooltip with the cursor
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 30) + "px");
        })
        .on("mouseout", function () {
            // Hide tooltip on mouseout for the "Foreign" dot
            tooltip.transition()
                .duration(500)
                .style("opacity", 0)
                .style("pointer-events", "none"); // Disable interaction with the tooltip
        });

    // Add dots for each year's "Domestic" data
    svg.selectAll(".dot-domestic")
        .data(yearTotals)
        .enter()
        .append("circle")
        .attr("class", "dot-domestic")
        .attr("cx", function (d) { return x(d.year) + x.bandwidth() / 2; })
        .attr("cy", function (d) { return y(d.domesticTotal); })
        .attr("r", 5) // Set dot radius
        .style("fill", colorScale("Domestic")) // Set dot color
        .on("mouseover", function (event, d) {
            // Show tooltip on hover for the "Domestic" dot
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltip.html("<strong>Year: " + d.year + "<br>Domestic: " + d.domesticTotal + "</strong>")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 30) + "px");
        })
        .on("mousemove", function (event) {
            // Move tooltip with the cursor
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 30) + "px");
        })
        .on("mouseout", function () {
            // Hide tooltip on mouseout for the "Domestic" dot
            tooltip.transition()
                .duration(500)
                .style("opacity", 0)
                .style("pointer-events", "none"); // Disable interaction with the tooltip
        });

    // Add x-axis
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text") // Select all text elements on the x-axis
        .style("fill", "white"); // Set the fill (text color) to white

    svg.selectAll(".x-axis path") // Select the x-axis lines
        .style("stroke", "white"); // Set the stroke (line color) to white

    svg.selectAll(".x-axis line") // Select the x-axis tick lines
        .style("stroke", "white"); // Set the stroke (line color) to white

    // Add y-axis
    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y))
        .selectAll("text") // Select all text elements on the y-axis
        .style("fill", "white"); // Set the fill (text color) to white

    svg.selectAll(".y-axis path") // Select the y-axis lines
        .style("stroke", "white"); // Set the stroke (line color) to white

    svg.selectAll(".y-axis line") // Select the y-axis tick lines
        .style("stroke", "white"); // Set the stroke (line color) to white


    // Add chart title
    svg.append("text")
        .attr("class", "chart-title")
        .attr("x", width / 2)
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .text("Visitor Arrival Over the Years");


    // Add a single legend with labels for "Domestic" and "Foreign"
    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (width) + "," + 0 + ")");

    // Add legend label for "Domestic"
    legend.append("rect")
        .attr("x", 0)
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", colorScale("Domestic"));

    legend.append("text")
        .attr("x", 25)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .style("fill", "white")
        .text("Domestic");

    // Add legend label for "Foreign"
    legend.append("rect")
        .attr("x", 0)
        .attr("y", 25)
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", colorScale("Foreign"));

    legend.append("text")
        .attr("x", 25)
        .attr("y", 34)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .style("fill", "white")
        .text("Foreign");

}


// Function to create the chord diagram
function createChordChart(data) {
    // Clear any existing chart
    d3.select("#chart").html("");
    d3.select("#legend").html("");

    // Get the regions and create the chord matrix
    var regions = Object.keys(data);

    console.log("dontknow",regions)

    // Define the width and height of the chord diagram
    var width = 800;
    var height = 500;

    // Calculate the total value of all regions except Sarawak
    var total = d3.sum(Object.values(data));

    console.log("dontknow what",total)

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

// Function to show the year slider
function showYearSlider() {

    var yearSlider = document.getElementById("year");
    var startYear = document.getElementById("StartYear");
    var endYear = document.getElementById("EndYear")
    var sliderTitle = document.getElementById("sliderTitle");

    yearSlider.style.display = "block";
    startYear.style.display = "block";
    endYear.style.display = "block";
    sliderTitle.style.display = "block";
}

// Function to hide the year slider
function hideYearSlider() {
    var yearSlider = document.getElementById("year");
    var startYear = document.getElementById("StartYear");
    var endYear = document.getElementById("EndYear")
    var sliderTitle = document.getElementById("sliderTitle");

    yearSlider.style.display = "none";
    startYear.style.display = "none";
    endYear.style.display = "none";
    sliderTitle.style.display = "none";
}

// Function to update the title with the selected year
function updateSliderTitle() {
    var selectedYear = yearSlider.value;
    sliderTitle.textContent = `Sarawak Visitor in ${selectedYear}`;
    updateCharts(selectedYear, currentChartType); // Update chart
}

// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
    yearSlider = document.getElementById("year"); // Define yearSlider in this scope
    var pieChartButton = document.getElementById("pieChartButton");
    var barChartButton = document.getElementById("barChartButton");
    var lineChartButton = document.getElementById("lineChartButton");
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

    // Add event listener for the bar chart button
    lineChartButton.addEventListener("click", function () {
        currentChartType = "line";
        updateCharts(yearSlider.value, currentChartType);
    });

    ChordChartButton.addEventListener("click", function () {
        currentChartType = "chord";
        updateCharts(yearSlider.value, currentChartType);
    });
});