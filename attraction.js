const width = 800;
const height = 500;

const yearElement = document.getElementById("currentYear");
const attractionElement = document.getElementById("currentPlace");
const totalVisitorElement = document.getElementById("total-visitor-arrival");

const mapping = {
  "national-parks": "data/national-parks.csv",
  "culture-village": "data/culture-village.csv",
  museums: "data/museums.csv",
};

const visitorDataMapping = {
  "national-parks": "data/national-park-visitors.csv",
  "culture-village": "data/culture-village-visitors.csv",
  museums: "data/museum-visitors.csv",
};

const choroplethColor = {
  "national-parks": d3.interpolateGreens,
  "culture-village": d3.interpolateReds,
  museums: d3.interpolateBlues,
};

const headerMapping = {
  "national-parks": ["#", "Name", "Domestic", "Foreign"],
  "culture-village": ["#", "Name", "Domestic", "Foreign"],
  museums: ["#", "Name", "Visitor"],
};

const svg = d3
  .select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .call(d3.zoom().on("zoom", zoomed));

const projection = d3
  .geoMercator()
  .center([112.608, 2.922])
  .translate([width / 2, height / 2])
  .scale(6800);

const path = d3.geoPath().projection(projection);

const tooltip = new bootstrap.Tooltip(document.body, {
  selector: '[data-bs-toggle="tooltip"]',
  boundary: "viewport",
});

let selectedYear = 2011;
let selectedAttraction = "national-parks";

function updateYear() {
  selectedYear = +document.getElementById("year").value;
  yearElement.innerHTML = selectedYear;
  renderMap();
}

function handlePlaceChange() {
  selectedAttraction = this.value;

  attractionElement.textContent = formatString(selectedAttraction);
  renderMap();
  updateTableHeader();
}

function zoomed(event) {
  const { transform } = event;
  svg.selectAll("path").attr("transform", transform);
  // svg.selectAll("circle").attr("transform", transform);
  svg.selectAll("image").attr("transform", transform);
}

function formatString(str) {
  return str
    .split("-") // Split the string on hyphens
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
    .join(" "); // Join the words back together with spaces
}

function reverseWindingOrder(polygon) {
  if (!polygon || !polygon.coordinates) return;

  // Reverse the main ring
  polygon.coordinates[0].reverse();

  // If there are any holes, reverse them too
  for (let i = 1; i < polygon.coordinates.length; i++) {
    polygon.coordinates[i].reverse();
  }
}

function createPieChartElement(data, desc) {
  let width = 350,
    height = 250,
    radius = 80;

  let svg = d3.create("svg").attr("width", width).attr("height", height);

  // Adjusting the translation to center the pie chart
  let g = svg
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  let pie = d3.pie().value((d) => d.value);
  let arc = d3.arc().innerRadius(0).outerRadius(radius);
  let labelArc = d3
    .arc()
    .innerRadius(radius - 30)
    .outerRadius(radius - 15);

  let color = d3
    .scaleOrdinal()
    .domain(["domestic", "foreign"])
    .range(["#4682B4", "#FFD700"]);

  g.selectAll("path")
    .data(pie(data))
    .enter()
    .append("path")
    .attr("d", arc)
    .style("fill", (d) => color(d.data.type));

  g.selectAll("text")
    .data(pie(data))
    .enter()
    .append("text")
    .attr("transform", function (d) {
      return "translate(" + labelArc.centroid(d) + ")";
    })
    .attr("dy", ".35em")
    .text(function (d) {
      return d.data.value;
    });

  // Position the legend towards the right side but with a margin
  let legend = svg
    .selectAll(".legend")
    .data(color.domain())
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", function (d, i) {
      return "translate(" + (width - 100) + "," + (i * 20 + 10) + ")";
    });

  legend
    .append("rect")
    .attr("x", 0)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color);

  legend
    .append("text")
    .attr("x", 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .text(function (d) {
      return d;
    });

  let div = document.createElement("div");
  div.className =
    "d-flex flex-column justify-content-center align-items-center";
  div.innerHTML += `<p class="text-justify">${desc}</p> <h3>Visitor Arrival</h3>`;
  div.appendChild(svg.node());
  return div;
}

function updatePieChart(visitorDataForPieChart) {
  const width = 200;
  const height = 200;
  const radius = Math.min(width, height) / 2;
  const svgWidth = width + 100;
  console.log(svgWidth);

  // Check if SVG already exists
  let pieSvg = d3.select("#pie-chart").select("svg");
  if (pieSvg.empty()) {
    pieSvg = d3
      .select("#pie-chart")
      .append("svg")
      .attr("width", svgWidth)
      .attr("height", height);
  }

  // Clear the existing pie chart content
  pieSvg.selectAll("*").remove();

  // Adjusting the translation to center the pie chart
  let g = pieSvg
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  // Create the pie layout function
  let pie = d3.pie().value((d) => d.count);
  let arc = d3.arc().innerRadius(0).outerRadius(radius);
  let labelArc = d3
    .arc()
    .innerRadius(radius / 2)
    .outerRadius(radius);

  // Define color scale
  let color = d3
    .scaleOrdinal()
    .domain(visitorDataForPieChart.map((d) => d.label))
    .range(["#4682B4", "#FFD700"]); // Adjust colors as needed

  // Draw the pie slices
  g.selectAll("path")
    .data(pie(visitorDataForPieChart))
    .enter()
    .append("path")
    .attr("d", arc)
    .style("fill", (d) => color(d.data.label));

  // Draw the labels
  g.selectAll("text")
    .data(pie(visitorDataForPieChart))
    .enter()
    .append("text")
    .attr("transform", (d) => "translate(" + labelArc.centroid(d) + ")") // This uses the new labelArc
    .attr("dy", ".35em")
    .style("text-anchor", "middle")
    .text((d) => d.data.count)
    .style("fill", "white");

  // Position the legend towards the right side but with a margin
  let legend = pieSvg
    .selectAll(".legend")
    .data(color.domain())
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr(
      "transform",
      (d, i) => "translate(" + (width + 10) + "," + (i * 20 + 10) + ")"
      // (d, i) => "translate(" + (width - 20) + "," + (i * 20 + 30) + ")"
    );

  // Draw the legend boxes
  legend
    .append("rect")
    .attr("x", 0)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color);

  // Draw the legend labels
  legend
    .append("text")
    .attr("x", 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "start")
    .text((d) => d)
    .style("fill", "white");
}

function updateTableHeader() {
  const headers = headerMapping[selectedAttraction];
  let thead = d3.select("#table thead");
  thead.selectAll("th").remove();
  thead
    .selectAll("th")
    .data(headers)
    .enter()
    .append("th")
    .attr("scope", "col")
    .text((d) => d);
}

function updateTable(visitors) {
  updateTableHeader();

  let tbody = d3.select("#table tbody");
  tbody.selectAll("tr").remove();
  let rows = tbody.selectAll("tr").data(visitors).enter().append("tr");
  rows
    .append("th")
    .attr("scope", "row")
    .text((d, i) => i + 1);

  switch (selectedAttraction) {
    case "national-parks":
    case "culture-village":
      rows.append("td").text((d) => d.name);
      rows.append("td").text((d) => d.domestic);
      rows.append("td").text((d) => d.foreign);
      break;
    case "museums":
      rows.append("td").text((d) => d.name);
      rows.append("td").text((d) => d.visitor);
      break;
  }
}

function renderMap() {
  svg.selectAll("*").remove();

  locationCsv = mapping[selectedAttraction];
  visitorCsv = visitorDataMapping[selectedAttraction];

  Promise.all([
    d3.json("swk.geojson"),
    d3.csv(locationCsv),
    d3.csv(visitorCsv),
  ]).then(function ([geojsonData, locationData, visitors]) {
    // Iterate over each feature to correct its winding order
    geojsonData.features.forEach((feature) => {
      if (feature.geometry.type === "Polygon") {
        reverseWindingOrder(feature.geometry);
      } else if (feature.geometry.type === "MultiPolygon") {
        feature.geometry.coordinates.forEach((polygon) => {
          reverseWindingOrder({ coordinates: polygon });
        });
      }
    });

    const locations = locationData.reduce((acc, park) => {
      acc[park.name] = park.district.trim();
      return acc;
    }, {});

    // Filter visitors based on the selected year
    visitors = visitors.filter((v) => Number(v.year) === Number(selectedYear));

    let totalDomestic = 0;
    let totalForeign = 0;

    // Calculate total domestic and foreign visitors
    visitors.forEach((visitor) => {
      totalDomestic += Number(visitor.domestic) || 0;
      totalForeign += Number(visitor.foreign) || 0;
    });

    // Create data for the pie chart
    const visitorDataForPieChart = [
      { label: "Domestic", count: totalDomestic },
      { label: "Foreign", count: totalForeign },
    ];

    updatePieChart(visitorDataForPieChart);
    updateTable(visitors);

    const districtVisitor = {}; // { district: 1000 }
    let totalVisitor = 0;

    for (const visitor of visitors) {
      const district = locations[visitor.name.trim()];
      let total;
      // Convert to number and default to 0 if NaN
      switch (selectedAttraction) {
        case "national-parks":
        case "culture-village":
          const domestic = Number(visitor.domestic) || 0;
          const foreign = Number(visitor.foreign) || 0;
          total = domestic + foreign;
          break;
        case "museums":
          total = Number(visitor.visitor) || 0;
          break;
        default:
          total = 0;
          break;
      }

      if (districtVisitor[district]) {
        districtVisitor[district] += total;
      } else {
        districtVisitor[district] = total;
      }

      // sum total visitor
      totalVisitor += total;
    }
    totalVisitorElement.innerHTML = totalVisitor;

    const logScale = d3
      .scaleLog()
      .domain([1, d3.max(Object.values(districtVisitor))])
      .range([0, 1]);

    const colorScale = d3
      .scaleSequential(choroplethColor[selectedAttraction])
      .domain([0, 1]);

    svg
      .selectAll("path")
      .data(geojsonData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", function (d) {
        const value = districtVisitor[d.properties.name];

        return value
          ? colorScale(logScale(value === 0 ? 1 : value))
          : colorScale(0);
      })
      .attr("stroke", "#000")
      .attr("stroke-width", 1)
      .attr("data-bs-toggle", "tooltip")
      .attr("title", (d) => d.properties.name)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", "yellow"); // or any other color
      })
      .on("mouseout", function (event, d) {
        const value = districtVisitor[d.properties.name];
        d3.select(this).attr(
          "fill",
          value ? colorScale(logScale(value)) : colorScale(0)
        );
      });

    // svg
    //   .selectAll("circle")
    //   .data(locationData)
    //   .enter()
    //   .append("circle")
    //   .attr("fill", "red")
    //   .attr("r", 4)
    //   .attr("cx", (d) => projection([+d.lon, +d.lat])[0])
    //   .attr("cy", (d) => projection([+d.lon, +d.lat])[1])
    //   .attr("data-bs-toggle", "popover")
    //   .attr("data-bs-html", "true")
    //   // .attr("data-bs-trigger", "hover")
    //   .attr("data-bs-trigger", "manual") // Set trigger to manual
    //   .style("cursor", "pointer")
    //   .on("mouseover", function (event, d) {
    //     d3.select(this)
    //       .transition()
    //       .duration(200) // Adjust as needed for animation speed
    //       .attr("r", 8) // Adjust to desired hover size
    //       .attr("fill", "blue"); // Change color if desired

    // // Find visitor data for the current park
    // const visitorInfo = visitors.find((v) => v.name === d.name);

    // let content;
    // if (visitorInfo) {
    //   switch (selectedAttraction) {
    //     case "national-parks":
    //     case "culture-village":
    //       const data = [
    //         { type: "domestic", value: +visitorInfo.domestic },
    //         { type: "foreign", value: +visitorInfo.foreign },
    //       ];

    //       content = createPieChartElement(data, d.description);
    //       break;
    //     case "museums":
    //       content = `<p class="text-justify">${d.description}</p> <p><strong>Total Visitors: </strong> ${visitorInfo.visitor}</p>`;
    //       break;
    //     default:
    //       content = `<p class="text-justify">${d.description}</p>`;
    //       break;
    //   }
    // } else {
    //   content = `<p class="text-justify">${d.description}</p> <p>No data available</p>`;
    // }

    // const popover = new bootstrap.Popover(this, {
    //   title: d.name,
    //   content: content,
    //   html: true,
    //   placement: "top",
    //   trigger: "manual",
    // });

    // popover.show();
    //   })
    //   .on("mouseout", function () {
    //     d3.select(this)
    //       .transition()
    //       .duration(200) // Adjust as needed for animation speed
    //       .attr("r", 4) // Reset to original size
    //       .attr("fill", "red"); // Reset to original color

    // const popover = bootstrap.Popover.getInstance(this);
    // if (popover) popover.hide();
    //   });

    // ---

    svg
      .selectAll("image")
      .data(locationData)
      .enter()
      .append("image")
      .attr("href", "./assets/pin.svg")
      .attr("width", 16) // Set the width of the pin
      .attr("height", 16) // Set the height of the pin
      .attr("x", (d) => projection([+d.lon, +d.lat])[0] - 8) // Adjust the x position
      .attr("y", (d) => projection([+d.lon, +d.lat])[1] - 8) // Adjust the y position
      .attr("data-bs-toggle", "popover")
      .attr("data-bs-html", "true")
      .attr("data-bs-trigger", "manual")
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("width", 32) // Enlarge the pin on hover
          .attr("height", 32)
          .attr("x", (d) => projection([+d.lon, +d.lat])[0] - 16) // Adjust x position for enlarged pin
          .attr("y", (d) => projection([+d.lon, +d.lat])[1] - 16); // Adjust y position for enlarged pin

        // Find visitor data for the current park
        const visitorInfo = visitors.find((v) => v.name === d.name);

        let content;
        if (visitorInfo) {
          switch (selectedAttraction) {
            case "national-parks":
            case "culture-village":
              const data = [
                { type: "domestic", value: +visitorInfo.domestic },
                { type: "foreign", value: +visitorInfo.foreign },
              ];

              content = createPieChartElement(data, d.description);
              break;
            case "museums":
              content = `<p class="text-justify">${d.description}</p> <p><strong>Total Visitors: </strong> ${visitorInfo.visitor}</p>`;
              break;
            default:
              content = `<p class="text-justify">${d.description}</p>`;
              break;
          }
        } else {
          content = `<p class="text-justify">${d.description}</p> <p>No data available</p>`;
        }

        const popover = new bootstrap.Popover(this, {
          title: d.name,
          content: content,
          html: true,
          placement: "top",
          trigger: "manual",
        });

        popover.show();
      })
      .on("mouseout", function (d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("width", 16) // Reset to original size
          .attr("height", 16)
          .attr("x", (d) => projection([+d.lon, +d.lat])[0] - 8) // Adjust x position
          .attr("y", (d) => projection([+d.lon, +d.lat])[1] - 8); // Adjust y position

        const popover = bootstrap.Popover.getInstance(this);
        if (popover) popover.hide();
      });
  });
}

document.getElementById("year").addEventListener("input", updateYear);
document.getElementById("place").addEventListener("change", handlePlaceChange);

const init = () => {
  yearElement.innerHTML = selectedYear;
  totalVisitorElement.innerHTML = 0;
  attractionElement.innerHTML = formatString(selectedAttraction);
  renderMap();
};

window.addEventListener("load", init);