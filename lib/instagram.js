const GRAPH_VERSION = process.env.INSTAGRAM_GRAPH_VERSION || "v24.0";
const MEDIA_FIELDS = [
  "id",
  "caption",
  "media_type",
  "media_product_type",
  "permalink",
  "timestamp"
].join(",");

function excerpt(text = "", maxLength = 130) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1).trim()}...`;
}

function titleFromCaption(caption = "") {
  const firstLine = caption.split("\n").map((line) => line.trim()).find(Boolean);
  return excerpt(firstLine || "Neues Reel", 62);
}

function isReel(item) {
  return item.media_product_type === "REELS" || item.permalink?.includes("/reel/");
}

function normalizeItem(item) {
  return {
    id: item.id,
    platform: "Instagram",
    title: titleFromCaption(item.caption),
    caption: excerpt(item.caption || ""),
    url: item.permalink,
    timestamp: item.timestamp || ""
  };
}

async function fetchInstagramReels({ limit = 6 } = {}) {
  const userId = process.env.INSTAGRAM_USER_ID;
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!userId || !token) {
    return {
      items: [],
      updatedAt: new Date().toISOString(),
      source: "missing-env"
    };
  }

  const params = new URLSearchParams({
    fields: MEDIA_FIELDS,
    limit: String(Math.max(limit * 3, 12)),
    access_token: token
  });

  const response = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${userId}/media?${params}`);
  const payload = await response.json();

  if (!response.ok) {
    const message = payload?.error?.message || `Instagram API returned ${response.status}`;
    throw new Error(message);
  }

  const items = (payload.data || [])
    .filter(isReel)
    .map(normalizeItem)
    .filter((item) => item.url)
    .slice(0, limit);

  return {
    items,
    updatedAt: new Date().toISOString(),
    source: "instagram-graph-api"
  };
}

module.exports = {
  fetchInstagramReels
};
