// get_token.js
const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");

// Load client secrets from file you downloaded from Google Cloud
const CREDENTIALS_PATH = "client_secret.json";
const TOKEN_PATH = "token.json";

// Scopes required for Gmail send
const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];

async function main() {
  const content = fs.readFileSync(CREDENTIALS_PATH);
  const { client_secret, client_id, redirect_uris } = JSON.parse(content).installed;

  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Generate URL
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline", // IMPORTANT → ensures refresh token is returned
    prompt: "consent",
    scope: SCOPES,
  });

  console.log("Authorize this app by visiting this url:", authUrl);

  // Read code from command line
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter the code from that page here: ", async (code) => {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // Save refresh token for later use
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    console.log("Token stored to", TOKEN_PATH);
    rl.close();
  });
}

main().catch(console.error);
// setup_auth.js
// This file is no longer needed after you have generated the token.json file
// Run get_token.js once to generate token.json