// netlify/functions/mfl.js
// Serverless proxy for MFL API — avoids browser CORS restrictions
const https = require("https");

exports.handler = async function(event) {
  const { type, extra = "" } = event.queryStringParameters || {};

  if (!type) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing type param" }) };
  }

  const LEAGUE_ID = "49712";
  const SEASON    = "2026";
  const HOST      = "www44";

  const decodedExtra = extra ? decodeURIComponent(extra) : "";
  const url = `https://${HOST}.myfantasyleague.com/${SEASON}/export?TYPE=${type}&L=${LEAGUE_ID}&JSON=1${decodedExtra}`;

  try {
    const data = await new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let body = "";
        res.on("data", chunk => body += chunk);
        res.on("end", () => {
          try { resolve({ status: res.statusCode, body }); }
          catch(e) { reject(e); }
        });
      }).on("error", reject);
    });

    return {
      statusCode: data.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: data.body,
    };
  } catch(e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message }),
    };
  }
};
