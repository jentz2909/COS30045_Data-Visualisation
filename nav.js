const links = [
  {
    href: "index.html",
    title: "Home Page",
    description: "About the website and assignment.",
  },
  {
    href: "attractions.html",
    title: "Attractions",
    description:
      "Visitor arrival for national parks, museums, and culture village.",
  },
  {
    href: "attractions-year.html",
    title:
      "Attractions <span class='badge bg-secondary'>(Yearly Overview)</span>",
    description:
      "(Yearly) Visitor arrival for national parks, museums, and culture village.",
  },
  {
    href: "visitors.html",
    title: "Visitors",
    description: "Visitor arrival from different citizen.",
  },
];

const menu = document.getElementById("menu");

const loadMenu = () => {
  let linksHTML = "";
  for (const link of links) {
    linksHTML += `
    <a
      href="${link.href}"
      class="list-group-item list-group-item-action text-white"
      aria-current="true"
    >
      <div class="d-flex w-100 justify-content-between">
        <h5 class="mb-1">${link.title}</h5>
      </div>
      <p class="mb-1">${link.description}</p>
    </a>
  `;
  }

  menu.innerHTML = linksHTML;
};

window.addEventListener('load', loadMenu);