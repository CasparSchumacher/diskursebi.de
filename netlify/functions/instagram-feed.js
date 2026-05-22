const { fetchInstagramReels } = require("../../lib/instagram");

exports.handler = async () => {
  try {
    const feed = await fetchInstagramReels({ limit: 6 });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=900, stale-while-revalidate=3600"
      },
      body: JSON.stringify(feed)
    };
  } catch (error) {
    return {
      statusCode: 502,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      },
      body: JSON.stringify({
        items: [],
        updatedAt: new Date().toISOString(),
        source: "instagram-error",
        message: error.message
      })
    };
  }
};
