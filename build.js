const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const dist = path.join(root, "dist");
const postsDir = path.join(root, "content", "posts");
const manifestPath = path.join(root, "data", "posts.json");

const copyTargets = [
  "index.html",
  "impressum.html",
  "datenschutz.html",
  "styles.css",
  "scripts.js",
  "_headers",
  "assets",
  "content",
  "data",
  "admin"
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writePostManifest() {
  ensureDir(path.dirname(manifestPath));
  ensureDir(postsDir);

  const posts = fs
    .readdirSync(postsDir)
    .filter((file) => file.endsWith(".md"))
    .sort()
    .reverse()
    .map((file) => `content/posts/${file}`);

  fs.writeFileSync(manifestPath, `${JSON.stringify({ posts }, null, 2)}\n`);
}

function copyTarget(target) {
  const from = path.join(root, target);
  const to = path.join(dist, target);
  if (!fs.existsSync(from)) return;
  fs.cpSync(from, to, { recursive: true });
}

async function build() {
  writePostManifest();
  fs.rmSync(dist, { recursive: true, force: true });
  ensureDir(dist);
  copyTargets.forEach(copyTarget);
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
