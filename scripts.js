const email = "diskursebi@gmail.com";

const fallbackSources = [
  {
    title: "Der Begriff der narrativen Hegemonie",
    type: "Bachelorarbeit",
    topic: "Narrative Hegemonie",
    format: "Forschung",
    description:
      "Meine veröffentlichte Bachelorarbeit an der LMU München. Darin geht es um narrative Hegemonie und politische Deutung.",
    url: "https://epub.ub.uni-muenchen.de/135673/"
  },
  {
    title: "Instagram: Diskursebi",
    type: "Kanal",
    topic: "Social Media",
    format: "Instagram",
    description:
      "Aktuelle Kurzformate, Einordnungen und Debattenimpulse auf Instagram.",
    url: "https://www.instagram.com/diskursebi?igsh=MTgxeDhvOTFmejhmdg%3D%3D&utm_source=qr"
  },
  {
    title: "TikTok: @diskursebi",
    type: "Kanal",
    topic: "Social Media",
    format: "TikTok",
    description:
      "Politische Aufklärung im vertikalen Videoformat mit Fokus auf schnelle Verständlichkeit.",
    url: "https://www.tiktok.com/@diskursebi?_r=1&_t=ZG-96VtGh1osAz"
  }
];

const fallbackFeatured = [
  {
    title: "Diskursanalyse im Reel-Format",
    platform: "Instagram",
    url: "https://www.instagram.com/diskursebi?igsh=MTgxeDhvOTFmejhmdg%3D%3D&utm_source=qr",
    accent: "linear-gradient(135deg, rgba(213,63,79,.88), rgba(126,167,255,.6))"
  },
  {
    title: "Kurze politische Einordnung",
    platform: "TikTok",
    url: "https://www.tiktok.com/@diskursebi?_r=1&_t=ZG-96VtGh1osAz",
    accent: "linear-gradient(135deg, rgba(92,224,196,.72), rgba(159,38,57,.78))"
  },
  {
    title: "Quellen und Kontext",
    platform: "Recherche",
    url: "#quellen",
    accent: "linear-gradient(135deg, rgba(246,239,224,.55), rgba(213,63,79,.72))"
  }
];

const $ = (selector, root = document) => root.querySelector(selector);
let renderedPosts = [];

function setHeaderState() {
  $("[data-header]")?.classList.toggle("is-scrolled", window.scrollY > 16);
}

function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    },
    { threshold: 0.14 }
  );

  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
}

async function getJson(path, fallback) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Could not load ${path}`);
    return response.json();
  } catch {
    return fallback;
  }
}

function renderSources(sources) {
  const sourceRoot = $("[data-sources]");
  const filterRoot = $("[data-source-filters]");
  if (!sourceRoot || !filterRoot) return;

  const topics = ["Alle", ...new Set(sources.map((source) => source.topic).filter(Boolean))];
  let activeTopic = "Alle";

  function paintFilters() {
    filterRoot.innerHTML = topics
      .map(
        (topic) =>
          `<button class="filter-button ${topic === activeTopic ? "is-active" : ""}" type="button" data-topic="${topic}">${topic}</button>`
      )
      .join("");
  }

  function paintCards() {
    const visibleSources =
      activeTopic === "Alle" ? sources : sources.filter((source) => source.topic === activeTopic);

    sourceRoot.innerHTML = visibleSources
      .map(
        (source) => `
          <article class="source-card">
            <div class="source-meta">
              <span class="pill">${source.type}</span>
              <span class="pill">${source.format}</span>
            </div>
            <h3>${source.title}</h3>
            <p>${source.description}</p>
            <a href="${source.url}" target="_blank" rel="noreferrer">Quelle öffnen</a>
          </article>
        `
      )
      .join("");
  }

  filterRoot.addEventListener("click", (event) => {
    const button = event.target.closest("[data-topic]");
    if (!button) return;
    activeTopic = button.dataset.topic;
    paintFilters();
    paintCards();
  });

  paintFilters();
  paintCards();
}

function renderFeatured(items) {
  const root = $("[data-featured-posts]");
  if (!root) return;
  const doubled = [...items, ...items];
  root.innerHTML = doubled
    .map(
      (item) => `
        <a class="motion-card" style="--card-bg: ${item.accent}" href="${item.url}" target="${item.url.startsWith("#") ? "_self" : "_blank"}" rel="noreferrer">
          <span>${item.platform}</span>
          <strong>${item.title}</strong>
        </a>
      `
    )
    .join("");
}

function parseFrontMatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: markdown };

  const meta = {};
  match[1].split("\n").forEach((line) => {
    const index = line.indexOf(":");
    if (index === -1) return;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    meta[key] = value;
  });

  return { meta, body: match[2].trim() };
}

function markdownSummary(markdown) {
  return markdown
    .replace(/^#+\s/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .split("\n")
    .filter(Boolean)
    .slice(0, 2)
    .join(" ");
}

function markdownToHtml(markdown) {
  return markdown
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("### ")) return `<h3>${trimmed.slice(4)}</h3>`;
      if (trimmed.startsWith("## ")) return `<h3>${trimmed.slice(3)}</h3>`;
      if (trimmed.startsWith("# ")) return `<h3>${trimmed.slice(2)}</h3>`;
      return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`;
    })
    .join("");
}

function openPost(index) {
  const dialog = $("[data-post-dialog]");
  const post = renderedPosts[index];
  if (!dialog || !post) return;

  $("[data-dialog-meta]").textContent = [post.meta.date, post.meta.category].filter(Boolean).join(" · ");
  $("[data-dialog-title]").textContent = post.meta.title || "Beitrag";
  $("[data-dialog-body]").innerHTML = markdownToHtml(post.body);

  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }
}

async function renderPosts() {
  const root = $("[data-posts]");
  if (!root) return;

  const manifest = await getJson("data/posts.json", { posts: ["content/posts/auftakt.md"] });
  const posts = await Promise.all(
    manifest.posts.map(async (path) => {
      try {
        const response = await fetch(path);
        const markdown = await response.text();
        const parsed = parseFrontMatter(markdown);
        return { ...parsed, path };
      } catch {
        return null;
      }
    })
  );

  const validPosts = posts.filter(Boolean);
  renderedPosts = validPosts;
  if (!validPosts.length) {
    root.innerHTML = `<article class="post-card"><h3>Erster Beitrag folgt</h3><p>Hier erscheinen künftig längere Einordnungen und Notizen.</p></article>`;
    return;
  }

  root.innerHTML = validPosts
    .map(
      (post, index) => `
        <article class="post-card">
          <div class="post-meta">
            <span class="pill">${post.meta.date || "Notiz"}</span>
            <span class="pill">${post.meta.category || "Diskurs"}</span>
          </div>
          <h3>${post.meta.title || "Unbenannter Beitrag"}</h3>
          <p>${markdownSummary(post.body)}</p>
          <button class="text-link" type="button" data-post-open="${index}">Beitrag lesen</button>
        </article>
      `
    )
    .join("");

  root.addEventListener("click", (event) => {
    const button = event.target.closest("[data-post-open]");
    if (!button) return;
    openPost(Number(button.dataset.postOpen));
  });
}

async function initContent() {
  const data = await getJson("data/site.json", {
    sources: fallbackSources,
    featuredPosts: fallbackFeatured
  });

  renderSources(data.sources || fallbackSources);
  renderFeatured(data.featuredPosts || fallbackFeatured);
  renderPosts();
}

function initCopyEmail() {
  const button = $("[data-copy-email]");
  const status = $("[data-copy-status]");
  if (!button || !status) return;

  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(email);
      status.textContent = "E-Mail kopiert.";
    } catch {
      status.textContent = email;
    }
  });
}

function initPostDialog() {
  const dialog = $("[data-post-dialog]");
  const close = $("[data-close-post]");
  if (!dialog || !close) return;

  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}

window.addEventListener("scroll", setHeaderState, { passive: true });
$("[data-year]").textContent = new Date().getFullYear();
setHeaderState();
initReveal();
initContent();
initCopyEmail();
initPostDialog();
