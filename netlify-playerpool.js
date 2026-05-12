// netlify/functions/playerpool.js
// Serverless proxy for Google Drive CSV — avoids browser CORS restrictions
const https = require("https");

const FILE_ID = "1KhDXLaMtoM94x_KccQ8I-Vok2m2N3UuF";

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      // Follow redirects (Google Drive does this)
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let body = "";
      res.on("data", chunk => body += chunk);
      res.on("end", () => resolve({ status: res.statusCode, body }));
    }).on("error", reject);
  });
}

exports.handler = async function() {
  const url = `https://drive.google.com/uc?export=download&id=${FILE_ID}`;
  try {
    const data = await fetchUrl(url);
    return {
      statusCode: data.status,
      headers: {
        "Content-Type": "text/csv",
        "Access-Control-Allow-Origin": "*",
      },
      body: data.body,
    };
  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
