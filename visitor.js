// Update the charts based on selected year and chart type
function updateCharts(selectedYear, chartType) {
    // Load the data from CSV file
    if (chartType === "pie") { //Choose chart type
        d3.csv("data/visitor_arrival.csv").then(function (data) {
            var yearData = data.filter(item => item.Year == selectedYear); // Fillter the year
            createPieChart(yearData);
            showYearSlider() // Show the year slider
        });
    }
    else if (chartType === "bar") {//Choose chart type
        d3.csv("data/visitor_arrival.csv").then(function (data) {
            // Get data by year
            var yearData = data.filter(item => item.Year == selectedYear);  // Fillter the year
            console.log(yearData)

            createBarChart(yearData);
            showYearSlider() // Show the year slider
        });
    }
    else if (chartType === "line") {//Choose chart type
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


            hideYearSlider(); // hide the year slider
        });
    }
    else if (chartType === "region") { //Choose chart type
        d3.csv("data/visitor_region.csv").then(function (data) {
            // Filter data for the selected year
            var yearData = data.filter(item => item.Year == selectedYear);

            console.log(yearData)

            // Create a chord chart using the grouped data
            createRegionChart(yearData);
            showYearSlider() // Show the year slider

        });
    }
    else {
        console.log("No found")
    }
}


// Function to create a pie chart
function createPieChart(yearData) {

    // Clear any existing legend
    d3.select("#chart").html("");
    d3.select("#legend").html("");

    // Convert values to numbers and sum for each category (Domestic and Foreign)
    var totalDomestic = d3.sum(yearData, d => +d.Domestic || 0);
    var totalForeign = d3.sum(yearData, d => +d.Foreign || 0);

    // Create a new data structure with the sum values
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
    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2 + 15})`);

    // Add chart title
    svg.append("text")
        .attr("x", 0)
        .attr("y", -height / 2 + 10) // Adjust the y-coordinate to position the title
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", "24px")
        .text("Domestic and Foreign Visitors in Sarawak");

    // Define the arc function to create pie segments
    var arc = d3.arc()
        .outerRadius(radius - 20)
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
        .text("Total Visitors");

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
                .text("Total Visitors");

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

    var margin = { top: 60, right: 50, bottom: 30, left: 100 };
    var width = 800 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;

    var svg = d3.select('#chart')
        .insert('svg', 'div')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Calculate the total value for each data point
    data.forEach(function (d) {
        d.Foreign = +d.Foreign; // Convert Foreign to a number
        d.Domestic = +d.Domestic; // Convert Domestic to a number
        d.Total = d.Foreign + d.Domestic;
    });

    var xScale = d3.scaleBand()
        .domain(data.map(function (d) {
            return d.Month;
        }))
        .range([0, width])
        .padding(0.05);

    // Calculate the maximum total value
    var maxTotal = d3.max(data, function (d) {
        return d.Total;
    });

    // Determine the number of ticks on the y-axis dynamically based on maxTotal
    var numTicks = Math.min(10, Math.ceil(maxTotal / 1000)); // Adjust the number of ticks as needed

    // Adjust the yScale domain and ticks based on the maximum total value and numTicks
    var yScale = d3.scaleLinear()
        .domain([0, maxTotal]) // Use maxTotal as the y-axis upper limit
        .nice(numTicks) // Generate nice ticks based on numTicks
        .range([height, 0]);

    var colorScale = d3.scaleOrdinal()
        .domain(["Foreign", "Domestic"])
        .range(["#007bff", "#28a745"]);

    var stack = d3.stack()
        .keys(["Foreign", "Domestic"]);

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
        .on("mousemove", function (event, d) {
            var category = d3.select(this.parentNode).datum().key; // Get the category (Domestic or Foreign)
            var total = d.data.Total;
            var value = Math.round(d[1] - d[0]); // Value inside the bar

            var tooltipText = category + ": " + value + "<br>" + " (Total: " + total + ")";

            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px")
                .style("display", "block")
                .html(tooltipText); // Use .html() to interpret line breaks ("<br>")
        })
        .on("mouseout", function () {
            tooltip.style("display", "none");
        });

    // Add text labels inside the bars to display the values at the center
    groups.selectAll("text")
        .data(function (d) { return d; })
        .enter().append("text")
        .attr("x", function (d) { return xScale(d.data.Month) + xScale.bandwidth() / 2; }) // Center text horizontally
        .attr("y", function (d) { return (yScale(d[0]) + yScale(d[1])) / 2; }) // Center text vertically
        .attr("dy", "0.3em")
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("user-select", "none")
        .style("font-size", "10")
        .style("pointer-events", "none")
        .text(function (d) { return Math.round(d[1] - d[0]); });


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
            .tickFormat(d3.format(".0f"))) // Format y-axis as integer
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

    // Change the position of the chart title to the center
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -30)
        .attr("text-anchor", "middle")
        .style("font-size", "24px")
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
        .style("font-size", "24px")
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
function createRegionChart(yearData) {
    // Clear any existing chart
    d3.select("#chart").html("");
    d3.select("#legend").html("");

    var regionMapping = {
        "Domestic": ["Peninsular Malaysia", "Sabah"],
        "Southeastern Asia": ["Singapore", "Brunei", "Philippines", "Thailand", "Indonesia"],
        "Europe": ["United Kingdom", "Germany", "France", "Nor/Swe/Den/Fin", "Belg/Lux/Net", "Russia", "Others Europe"],
        "Eastern Asia": ["China", "Japan", "Taiwan", "Hong Kong", "South Korea"],
        "Others": ["Others", "Arabs", "Canada", "USA", "Latin America"],
        "Southern Asia": ["Sri Lanka", "Bangladesh", "Pakistan", "India"],
        "Oceania": ["Australia", "New Zealand"],
    };

    // Initialize an empty object to store region values
    var regionData = {};

    // Populate regionData with values for each region
    for (var yearDatum of yearData) {
        for (var region in regionMapping) {
            var countriesInRegion = regionMapping[region];
            var regionValue = d3.sum(countriesInRegion, country => +yearDatum[country] || 0);
            regionData[region] = (regionData[region] || 0) + regionValue;
        }
    }

    // Convert regionData object into an array of objects
    var pieData = Object.keys(regionData).map(region => ({
        label: region,
        value: regionData[region]
    }));

    // Calculate the total
    var total = d3.sum(pieData, d => d.value);

    // Set chart dimensions
    var width = 800;
    var height = 500;
    var radius = Math.min(width, height) / 2;

    // CustomeColor design
    var customColors = ["#ff6961", "#ffb480", "#f8f38d", "#42d6a4", "#08cad1", "#9d94ff", "#D3D3D3"];


    // Create a color scale for the pie chart segments
    var color = d3.scaleOrdinal()
        .domain(pieData.map(d => d.label))
        .range(customColors); // Use a color scheme

    // Create an SVG element
    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2 + 15})`);

    // Define the arc function to create pie segments
    var arc = d3.arc()
        .outerRadius(radius - 20)
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

    // Add chart title
    svg.append("text")
        .attr("x", 0)
        .attr("y", -height / 2 + 10)
        .attr("text-anchor", "middle")
        .style("font-size", "24px")
        .style("fill", "white")
        .text("Sarawak Visitor by Region"); // Text of the title

    // Calculate the position for the hover text
    var textX = 0;
    var textY = 0;

    // Create a group for text elements in the center
    var centerTextGroup = svg.append("g")
        .attr("class", "center-text-group")
        .attr("transform", `translate(${textX}, ${textY})`)
        .style("font-size", "26px")
        .style("font-weight", "700")
        .style("fill", "white")
        .style("text-anchor", "middle")
        .style("dominant-baseline", "middle");

    // Initialize the center text with the total sum value
    var centerText = centerTextGroup.append("text")
        .attr("class", "center-text")
        .style("pointer-events", "none");

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
        })

    // Add a click event handler to the pie chart segments
    arcs.on("click", function (event, d) {
        // Check if the pie chart container is already present
        var pieChartContainer = d3.select("#pie-chart");

        // Remove the existing pie chart if it's open
        if (!pieChartContainer.empty()) {
            pieChartContainer.remove();
            return; // Exit the function to prevent creating a new one
        }

        // Create a container for the pie chart
        pieChartContainer = d3.select("body")
            .append("div")
            .attr("id", "pie-chart")
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "1px solid #ccc")
            .style("padding", "10px")
            .style("box-shadow", "2px 2px 5px #888")
            .style("pointer-events", "none"); // Prevent interaction with the container

        // Calculate the data for the pie chart based on the clicked segment
        var clickedRegion = d.data.label;
        var regionData = yearData; // Get all the data

        // Initialize an empty object to store the summed citizen counts
        var citizenCounts = {};

        // Iterate through each data object in yearData and sum the citizen counts for the clicked region
        regionData.forEach(function (monthData) {
            Object.entries(monthData)
                .filter(([country, value]) => regionMapping[clickedRegion].includes(country))
                .forEach(([country, value]) => {
                    citizenCounts[country] = (citizenCounts[country] || 0) + (+value || 0);
                });
        });

        // Convert citizenCounts object into an array of objects
        var pieChartData = Object.keys(citizenCounts).map(country => ({
            label: country,
            value: citizenCounts[country]
        }));

        console.log(clickedRegion)
        console.log(regionData)
        console.log(pieChartData)

        // Sort pieChartData by value in descending order
        pieChartData.sort((a, b) => b.value - a.value);

        // Set dimensions for the pie chart
        var pieChartWidth = 200;
        var pieChartHeight = 200;
        var radius = Math.min(pieChartWidth, pieChartHeight) / 2;

        // Create an SVG element for the pie chart
        var svg = pieChartContainer
            .append("svg")
            .attr("width", pieChartWidth)
            .attr("height", pieChartHeight)
            .append("g")
            .attr("transform", `translate(${pieChartWidth / 2},${pieChartHeight / 2})`);

        // Create an arc function for the pie chart segments
        var arc = d3.arc()
            .outerRadius(radius - 10)
            .innerRadius(0);

        // Create a pie layout for the pie chart
        var pie = d3.pie()
            .sort(null)
            .value(d => d.value);

        // Create pie chart segments
        var pieArcs = svg.selectAll(".pie-arc")
            .data(pie(pieChartData))
            .enter()
            .append("g")
            .attr("class", "pie-arc");


        // Define the custom color range
        var customColors = ["#F6EBEB", "#F8CDD2", "#FAAEBB", "#FC8FA8", "#FD7099", "#FF508C", "#FF3083"];

        // Create an ordinal scale with the custom color range
        var color = d3.scaleOrdinal()
            .domain(pieData.map(d => d.label))
            .range(customColors);


        // Add path elements to represent the segments
        pieArcs.append("path")
            .attr("d", arc)
            .attr("fill", d => color(d.data.label))
            .style("stroke", "white");

        // Create a legend for the pie chart
        var legend = pieChartContainer.append("div")
            .attr("class", "legend")
            .style("margin-top", "10px");

        var legendItems = legend.selectAll(".legend-item")
            .data(pieChartData)
            .enter()
            .append("div")
            .attr("class", "legend-item");

        legendItems.append("div")
            .style("width", "10px")
            .style("height", "10px")
            .style("background-color", d => color(d.label))
            .style("display", "inline-block")
            .style("margin-right", "5px");

        legendItems.append("span")
            .text(d => `${d.label}: ${d.value} visitors`);

        // Position the pie chart container next to the mouse cursor
        pieChartContainer.style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - pieChartHeight / 2) + "px");

    });



    // Create legend
    var legend = d3.select("#chart")
        .append("div")
        .attr("class", "legend")
        .style("position", "absolute")
        .style("margin-top", "150px")
        .style("margin-left", '700px')
        .style("display", "block")
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
        .style("background-color", (d) => color(d.label)); // Use label for color mapping

    keys.append("div")
        .attr("class", "name")
        .text((d) => d.label); // Display the exact label

    keys.exit().remove();

}


// Declare variables in a scope accessible by all functions
var yearSlider;
var sliderTitle;
var currentChartType = "pie";

// Define a variable to keep track of whether the pie chart is currently displayed
var isPieChartVisible = false;

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
    var lineChartButton = document.getElementById("lineChartButton");
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

    lineChartButton.addEventListener("click", function () {
        currentChartType = "region";
        updateCharts(yearSlider.value, currentChartType);
    });
});