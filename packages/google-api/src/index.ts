import { google } from "googleapis";
import path from "path";
import fs from "fs";

// Google Cloud Authentication (Supports OAuth2 Refresh Token or Service Account)
export const getGoogleAuth = () => {
  // Option 1: User OAuth2 Refresh Token (Best for Personal Accounts & Quota)
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) {
    console.log("[Google Auth] Using personal account OAuth2 Refresh Token.");
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "http://localhost"
    );
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });
    return oauth2Client;
  }

  // Option 2: Service Account (Previous method)
  let credentials;
  let absolutePath;

  const serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH;
  if (serviceAccountPath) {
    const attemptedPath = path.isAbsolute(serviceAccountPath) 
      ? serviceAccountPath 
      : path.join(process.cwd(), serviceAccountPath);
    
    if (fs.existsSync(attemptedPath)) {
        absolutePath = attemptedPath;
        console.log(`[Google Auth] Using Service Account from: ${absolutePath}`);
    } else {
        const rootPath = path.join(process.cwd(), "..", "..", serviceAccountPath);
        if (fs.existsSync(rootPath)) {
            absolutePath = rootPath;
            console.log(`[Google Auth] Using Service Account from root: ${absolutePath}`);
        }
    }
  }

  if (!absolutePath && process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    console.log("[Google Auth] Using Service Account from GOOGLE_SERVICE_ACCOUNT_JSON env.");
    credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  }

  if (!absolutePath && !credentials) {
    throw new Error("No valid Google Authentication found (OAuth2 or Service Account)");
  }

  return new google.auth.GoogleAuth({
    keyFile: absolutePath || undefined,
    credentials: !absolutePath ? credentials : undefined,
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/admin.directory.user"
    ]
  });
};

export * from "./drive";
export * from "./admin";
export * from "./WorkspaceAdminService";
export * from './services/places';
