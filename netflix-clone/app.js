const app = document.getElementById("app");
const nav = document.getElementById("nav");
const searchBox = document.getElementById("search");
const searchInput = document.getElementById("searchInput");
const modal = document.getElementById("modal");

let view = "home";
let list = [];
try { list = JSON.parse(localStorage.getItem("myList") || "[]"); } catch (e) {}

const byId = id => TITLES.find(t => t.id === id);
const art = t => `linear-gradient(135deg, hsl(${t.hue},70%,38%), hsl(${(t.hue + 50) % 360},60%,12%))`;
const saveList = () => { try { localStorage.setItem("myList", JSON.stringify(list)); } catch (e) {} };
const length = t => t.type === "series" ? `${t.seasons} Season${t.seasons > 1 ? "s" : ""}` : t.runtime;

function toast(msg) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1800);
}

function toggleList(id) {
  const had = list.includes(id);
  list = had ? list.filter(x => x !== id) : [...list, id];
  saveList();
  toast(had ? "Removed from My List" : "Added to My List");
  render();
  if (!modal.classList.contains("hidden")) openModal(id);
}

function cardHTML(t) {
  const inList = list.includes(t.id);
  return `<div class="card" data-id="${t.id}" style="background:${art(t)}">
    <div class="name">${t.title}</div>
    <div class="tag">${t.genres.join(" • ")}</div>
    <div class="quick">
      <button class="circle" data-play="${t.id}" aria-label="Play">&#9654;</button>
      <button class="circle" data-list="${t.id}" aria-label="My List">${inList ? "&#10003;" : "+"}</button>
    </div>
  </div>`;
}

function heroHTML(t) {
  return `<section class="hero" style="background:${art(t)}">
    <div class="shade"></div>
    <div class="hero-content">
      <h1>${t.title}</h1>
      <div class="meta"><span class="match">${t.match}% Match</span><span>${t.year}</span><span class="badge">${t.rating}</span><span>${length(t)}</span></div>
      <p>${t.desc}</p>
      <div class="btns">
        <button class="btn play" data-play="${t.id}">&#9654; Play</button>
        <button class="btn info" data-id="${t.id}">&#9432; More Info</button>
      </div>
    </div>
  </section>`;
}

function rowHTML(name, items) {
  if (!items.length) return "";
  return `<div class="row"><h2>${name}</h2><div class="track">${items.map(cardHTML).join("")}</div></div>`;
}

function render() {
  const q = searchInput.value.trim().toLowerCase();
  if (q) {
    const hits = TITLES.filter(t => (t.title + " " + t.genres.join(" ")).toLowerCase().includes(q));
    app.innerHTML = `<div class="grid"><h2>Results for "${q.replace(/[<>&"]/g, "")}"</h2>${hits.map(cardHTML).join("") || '<p class="empty">No titles match your search.</p>'}</div>`;
    return;
  }
  if (view === "home") {
    const featured = TITLES.find(t => t.id === 9);
    app.innerHTML = heroHTML(featured) + `<div class="rows">` +
      (list.length ? rowHTML("My List", list.map(byId)) : "") +
      ROWS.map(r => rowHTML(r.name, r.ids ? r.ids.map(byId) : TITLES.filter(r.filter))).join("") + `</div>`;
    return;
  }
  const items = view === "list" ? list.map(byId) : TITLES.filter(t => t.type === view);
  const heading = { series: "TV Shows", movie: "Movies", list: "My List" }[view];
  app.innerHTML = `<div class="grid"><h2>${heading}</h2>${items.map(cardHTML).join("") || '<p class="empty">Nothing here yet. Hit + on any title to add it.</p>'}</div>`;
}

function openModal(id) {
  const t = byId(id);
  const inList = list.includes(id);
  document.getElementById("mHero").style.background = art(t);
  document.getElementById("mHero").innerHTML = `<div><h1>${t.title}</h1>
    <div class="btns"><button class="btn play" data-play="${t.id}">&#9654; Play</button>
    <button class="btn info" data-list="${t.id}">${inList ? "&#10003; In My List" : "+ My List"}</button></div></div>`;
  const eps = t.type === "series" ? `<div class="eps"><h3>Episodes</h3>${[1, 2, 3, 4, 5].map(n =>
    `<div class="ep"><div class="n">${n}</div><div><div class="t">Episode ${n}</div><div class="d">${t.desc.split(".")[0]}. Part ${n}.</div></div></div>`).join("")}</div>` : "";
  document.getElementById("mBody").innerHTML = `<div>
      <div class="meta"><span class="match">${t.match}% Match</span><span>${t.year}</span><span class="badge">${t.rating}</span><span>${length(t)}</span></div>
      <p>${t.desc}</p></div>
    <div class="side"><div><span>Genres:</span> ${t.genres.join(", ")}</div><div><span>Type:</span> ${t.type === "series" ? "TV Show" : "Movie"}</div></div>${eps}`;
  modal.classList.remove("hidden");
}
const closeModal = () => modal.classList.add("hidden");

document.addEventListener("click", e => {
  const play = e.target.closest("[data-play]");
  if (play) { e.stopPropagation(); toast("Playing " + byId(+play.dataset.play).title + " (demo)"); return; }
  const add = e.target.closest("[data-list]");
  if (add) { e.stopPropagation(); toggleList(+add.dataset.list); return; }
  const open = e.target.closest("[data-id]");
  if (open) { openModal(+open.dataset.id); return; }
  if (e.target === modal || e.target.id === "closeModal") closeModal();
  const link = e.target.closest("nav a");
  if (link) {
    e.preventDefault();
    view = link.dataset.view;
    searchInput.value = "";
    document.querySelectorAll("nav a").forEach(a => a.classList.toggle("active", a === link));
    render();
    window.scrollTo(0, 0);
  }
});

document.getElementById("searchBtn").addEventListener("click", () => {
  searchBox.classList.toggle("open");
  if (searchBox.classList.contains("open")) searchInput.focus();
});
searchInput.addEventListener("input", render);
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
window.addEventListener("scroll", () => nav.classList.toggle("solid", window.scrollY > 40));

render();
