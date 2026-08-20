import { google } from "googleapis";
import http from "http";
import url from "url";

const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3333/callback";

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: ["https://www.googleapis.com/auth/gmail.send"],
  prompt: "consent",
});

console.log("\nOpen this URL in your browser:\n");
console.log(authUrl);
console.log("\nWaiting for callback on http://localhost:3333/callback ...\n");

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url!, true);
  const code = parsedUrl.query.code as string;

  if (!code) {
    res.writeHead(400);
    res.end("No code received");
    return;
  }

  const { tokens } = await oauth2Client.getToken(code);
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end("<h1>Success! You can close this tab.</h1>");

  console.log("=== Add these to your .env / Vercel ===\n");
  console.log(`GMAIL_REFRESH_TOKEN="${tokens.refresh_token}"`);
  console.log("\n========================================\n");

  server.close();
  process.exit(0);
});

server.listen(3333);
