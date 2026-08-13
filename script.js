(async function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Load config ----------
  let config;
  try {
    const res = await fetch("config.json", { cache: "no-store" });
    config = await res.json();
  } catch (err) {
    console.error("Could not load config.json", err);
    $("hero-name").textContent = "Config not found";
    $("hero-bio").textContent = "Add a config.json next to index.html to populate this page.";
    return;
  }

  // ---------- Populate hero / brand ----------
  $("hero-name").textContent = config.name || "";
  $("hero-role").textContent = config.role || "";
  $("hero-bio").textContent = config.bio || "";

  $("qr-role").textContent = config.role || "—";
  $("qr-stack").textContent = config.stack || "—";
  $("qr-status").textContent = config.status || "—";
  $("qr-location").textContent = config.location || "—";

  $("contact-sub").textContent = config.status
    ? `${config.status} — reach out any time.`
    : "Reach out any time.";

  // ---------- Links ----------
  const links = config.links || {};
  [
    ["link-github", links.github],
    ["link-linkedin", links.linkedin],
    ["hero-linkedin", links.linkedin],
    ["contact-github", links.github],
    ["contact-linkedin", links.linkedin],
  ].forEach(([id, url]) => {
    const el = $(id);
    if (el && url) el.href = url;
    else if (el) el.style.display = "none";
  });

  // ---------- Education ----------
  const edu = config.education || {};
  $("edu-institution").textContent = edu.institution || "";
  $("edu-degree").textContent = edu.degree || "";
  $("edu-period").textContent = edu.period || "";
  $("edu-gpa").textContent = edu.gpa || "";
  $("edu-expected").textContent = edu.expected || "";
  const eduNotes = $("edu-notes");
  (edu.notes || []).forEach((note) => {
    const li = document.createElement("li");
    li.textContent = note;
    eduNotes.appendChild(li);
  });

  // ---------- Skills (grouped cards) ----------
  const skillsGrid = $("skills-grid");
  (config.skillGroups || []).forEach((group) => {
    const card = document.createElement("div");
    card.className = "skill-card";
    const items = (group.items || [])
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
    card.innerHTML = `
      <h3 class="skill-card-title">${escapeHtml(group.title)}</h3>
      <ul class="skill-list">${items}</ul>
    `;
    skillsGrid.appendChild(card);
  });

  // ---------- Projects ----------
  renderProjectList(config.projects || []);
  if (config.links && config.links.github) {
    $("more-github").href = config.links.github;
  }

  // ---------- Tab bar navigation (scrollspy) ----------
  setupTabbar();

  // ===================================================

  function renderProjectList(projects) {
    const list = $("project-list");
    list.innerHTML = "";

    if (!projects.length) {
      list.innerHTML = `<p class="project-empty">No projects added yet.</p>`;
      return;
    }

    projects.forEach((p) => {
      const entry = document.createElement("article");
      entry.className = "project-entry";

      const tools = (p.tools || [])
        .map((t) => `<span class="tool-pill">${escapeHtml(t)}</span>`)
        .join("");
      const bullets = (p.bullets || [])
        .map((b) => `<li>${escapeHtml(b)}</li>`)
        .join("");

      entry.innerHTML = `
        <div class="project-entry-head">
          <h3 class="project-entry-name">${escapeHtml(p.name)}</h3>
          <span class="mono project-entry-period">${escapeHtml(p.period || "")}</span>
        </div>
        <div class="tool-row">${tools}</div>
        <ul class="project-bullets">${bullets}</ul>
        ${
          p.url
            ? `<a class="btn btn-ghost project-view-btn" href="${escapeAttr(
                p.url
              )}" target="_blank" rel="noopener">View project →</a>`
            : ""
        }
      `;
      list.appendChild(entry);
    });
  }

  function setupTabbar() {
    const tabs = Array.from(document.querySelectorAll(".tab"));
    const sections = tabs
      .map((t) => document.getElementById(t.dataset.tab))
      .filter(Boolean);

    if (!("IntersectionObserver" in window)) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === id));
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => obs.observe(s));
  }

  function escapeAttr(str) {
    return escapeHtml(str).replace(/`/g, "&#96;");
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
