(async function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.getElementById("year").textContent = new Date().getFullYear();

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
  $("brand-tag").textContent = `-- ${config.githubUsername || "user"}`;
  $("hero-name").textContent = config.name || "";
  $("hero-role").textContent = config.role || "";
  $("hero-bio").textContent = config.bio || "";
  $("footer-name").textContent = config.name || "";

  $("qr-role").textContent = config.role || "—";
  $("qr-stack").textContent = config.stack || "—";
  $("qr-status").textContent = config.status || "—";
  $("qr-location").textContent = config.location || "—";

  $("about-tagline").textContent = config.tagline || "";
  $("contact-sub").textContent = config.status
    ? `${config.status} — reach out any time.`
    : "Reach out any time.";

  if (config.avatar) {
    $("avatar-img").src = config.avatar;
  }
  const initials = (config.name || "")
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  document.querySelector(".avatar-fallback-label").textContent = initials || "?";

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

  // ---------- Skills (spreadsheet rows) ----------
  const skillsBody = $("skills-body");
  (config.skills || []).forEach((skill, i) => {
    const row = document.createElement("div");
    row.className = "sheet-row";
    row.innerHTML = `
      <span class="skill-name">${escapeHtml(skill.name)}</span>
      <span class="skill-cat">${escapeHtml(skill.category || "")}</span>
      <span class="skill-bar-track">
        <span class="skill-bar-fill" data-level="${skill.level || 0}"></span>
      </span>
    `;
    skillsBody.appendChild(row);
  });

  // Animate skill bars once visible
  const bars = document.querySelectorAll(".skill-bar-fill");
  const fillBar = (bar) => {
    const level = bar.getAttribute("data-level");
    bar.style.width = prefersReducedMotion ? `${level}%` : `${level}%`;
  };
  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            fillBar(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    bars.forEach((b) => obs.observe(b));
  } else {
    bars.forEach(fillBar);
  }

  // ---------- Projects ----------
  await loadProjects(config);

  // ---------- Tab bar navigation (scrollspy) ----------
  setupTabbar();

  // ===================================================

  async function loadProjects(cfg) {
    const grid = $("project-grid");
    const status = $("projects-status");
    const max = cfg.maxProjects || 6;

    // Manual projects override / supplement GitHub fetch
    if (Array.isArray(cfg.manualProjects) && cfg.manualProjects.length) {
      status.textContent = "curated projects";
      renderProjects(cfg.manualProjects.slice(0, max));
      return;
    }

    if (cfg.projectsSource !== "github" || !cfg.githubUsername) {
      status.textContent = "";
      grid.innerHTML = `<p class="project-empty">No projects configured yet.</p>`;
      return;
    }

    try {
      const url = `https://api.github.com/users/${encodeURIComponent(
        cfg.githubUsername
      )}/repos?sort=updated&per_page=100`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`GitHub API responded ${res.status}`);
      let repos = await res.json();

      repos = repos
        .filter((r) => !r.fork)
        .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, max);

      if (!repos.length) {
        status.textContent = "";
        grid.innerHTML = `<p class="project-empty">No public repositories yet — check back soon.</p>`;
        return;
      }

      status.textContent = `${repos.length} repositories loaded from github.com/${cfg.githubUsername}`;
      renderProjects(
        repos.map((r) => ({
          name: r.name,
          description: r.description || "No description provided.",
          url: r.html_url,
          language: r.language,
          stars: r.stargazers_count,
        }))
      );
    } catch (err) {
      console.error(err);
      status.textContent = "";
      grid.innerHTML = `<p class="project-error">Couldn't load repositories from GitHub right now. Refresh to try again.</p>`;
    }
  }

  function renderProjects(projects) {
    const grid = $("project-grid");
    grid.innerHTML = "";
    projects.forEach((p) => {
      const card = document.createElement("a");
      card.className = "project-card";
      card.href = p.url || "#";
      card.target = "_blank";
      card.rel = "noopener";
      card.innerHTML = `
        <span class="project-name">${escapeHtml(p.name)}</span>
        <span class="project-desc">${escapeHtml(p.description || "")}</span>
        <span class="project-meta">
          ${p.language ? `<span class="lang-pill">${escapeHtml(p.language)}</span>` : ""}
          ${typeof p.stars === "number" ? `<span>★ ${p.stars}</span>` : ""}
        </span>
        <span class="project-link">View repository →</span>
      `;
      grid.appendChild(card);
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

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
