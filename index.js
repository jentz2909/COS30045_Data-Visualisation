let currentYear = 2021;

function updateYear() {
  var yearSlider = document.getElementById("year");
  var currentYearDisplay = document.getElementById("currentYear");
  currentYear = yearSlider.value;
  currentYearDisplay.textContent = currentYear;
  loadDataAndRender(); // reload data and update visualization
}

function zoomed(event) {
  const { transform } = event;
  svg.selectAll("path").attr("transform", transform);
  svg.selectAll("circle").attr("transform", transform);
}

// Width and height for the SVG canvas
const width = 800;
const height = 500;

// Create an SVG canvas
const svg = d3
  .select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .call(d3.zoom().on("zoom", zoomed));

// Define a projection for the map (using Mercator for this example)
const projection = d3
  .geoMercator()
  .center([112.608, 2.922])
  .translate([width / 2, height / 2])
  .scale(6800); // Adjusted scale to fit the data

const path = d3.geoPath().projection(projection);

function createPieChartElement(data, desc) {
  let width = 350,
    height = 250,
    radius = 80;

  let svg = d3.create("svg").attr("width", width).attr("height", height);
  // .attr("class", "bg-primary");

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
  div.innerHTML += `<p class="text-justify">${desc}</p>`;
  div.appendChild(svg.node());
  return div;
}

function loadDataAndRender(csv = "data/national-parks.csv") {
  svg.selectAll("*").remove();

  Promise.all([
    d3.json("swk.geojson"),
    d3.csv(csv),
    d3.csv(`data/national-parks-visitor/${currentYear}.csv`),
  ]).then(function ([geojsonData, parkData, visitorData]) {
    svg
      .selectAll("path")
      .data(geojsonData.features)
      .enter()
      .append("path")
      .attr("d", path);

    svg
      .selectAll("circle")
      .data(parkData)
      .enter()
      .append("circle")
      .attr("fill", "red")
      .attr("r", 4)
      .attr("cx", (d) => projection([+d.lon, +d.lat])[0])
      .attr("cy", (d) => projection([+d.lon, +d.lat])[1])
      .attr("data-bs-toggle", "popover")
      .attr("data-bs-html", "true")
      // .attr("data-bs-trigger", "hover")
      .attr("data-bs-trigger", "manual") // Set trigger to manual
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200) // Adjust as needed for animation speed
          .attr("r", 8) // Adjust to desired hover size
          .attr("fill", "blue"); // Change color if desired

        console.log(d.name);
        // Find visitor data for the current park
        const visitorInfo = visitorData.find((v) => v.name === d.name);

        let content;
        if (visitorInfo) {
          const data = [
            { type: "domestic", value: +visitorInfo.domestic },
            { type: "foreign", value: +visitorInfo.foreign },
          ];

          content = createPieChartElement(data, d.description);
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
      .on("mouseout", function () {
        d3.select(this)
          .transition()
          .duration(200) // Adjust as needed for animation speed
          .attr("r", 4) // Reset to original size
          .attr("fill", "red"); // Reset to original color

        const popover = bootstrap.Popover.getInstance(this);
        if (popover) popover.hide();
      });
  });
}
loadDataAndRender();

// document.addEventListener("click", function (event) {
//   // If the clicked element is not a circle, close all popovers
//   if (!event.target.matches("circle")) {
//     document.querySelectorAll("circle").forEach(function (circle) {
//       const popover = bootstrap.Popover.getInstance(circle);
//       if (popover) popover.hide();
//     });
//   }
// });

document.getElementById("place").addEventListener("change", function () {
  let selectedValue = this.value;
  let csvFile;

  switch (selectedValue) {
    case "1":
      csvFile = "data/national-parks.csv";
      break;
    case "2":
      csvFile = "data/culture-village.csv";
      break;
    case "3":
      csvFile = "data/museums.csv";
      break;
    default:
      csvFile = "data/national-parks.csv";
      break;
  }
  console.log(csvFile)

  loadDataAndRender(csvFile);
});
