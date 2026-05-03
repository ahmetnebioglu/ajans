import { google } from "googleapis";
import path from "path";
import fs from "fs";
import { getGoogleSettings } from "./settings";

// Google Cloud Authentication (Hybrid: Supports Service Account & OAuth2 Refresh Token)
export const getGoogleAuth = async () => {
  const settings = await getGoogleSettings();
  
  const clientId = settings?.googleClientId || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = settings?.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = settings?.googleRefreshToken || process.env.GOOGLE_REFRESH_TOKEN;

  // 1. Yol: OAuth2 Refresh Token (Bireysel hesap kotasını kullanmak için en iyisi)
  if (clientId && clientSecret && refreshToken) {
    console.log("[Google Auth] Using dynamic OAuth2 Refresh Token.");
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      "http://localhost"
    );
    oauth2Client.setCredentials({
      refresh_token: refreshToken
    });
    return oauth2Client;
  }

  // 2. Yol: Service Account (google-credentials.json dosyası varsa)
  const keyPath = path.join(process.cwd(), "google-credentials.json");
  if (fs.existsSync(keyPath)) {
    console.log(`[Google Auth] Using Service Account from: ${keyPath}`);
    return new google.auth.GoogleAuth({
      keyFile: keyPath,
      scopes: ["https://www.googleapis.com/auth/drive.file"]
    });
  }

  // 3. Yol: Çevresel değişkenlerden gelen Service Account yolu
  if (process.env.GOOGLE_SERVICE_ACCOUNT_PATH) {
    const envPath = path.isAbsolute(process.env.GOOGLE_SERVICE_ACCOUNT_PATH) 
      ? process.env.GOOGLE_SERVICE_ACCOUNT_PATH 
      : path.join(process.cwd(), process.env.GOOGLE_SERVICE_ACCOUNT_PATH);
    
    if (fs.existsSync(envPath)) {
      console.log(`[Google Auth] Using Service Account from ENV path: ${envPath}`);
      return new google.auth.GoogleAuth({
        keyFile: envPath,
        scopes: ["https://www.googleapis.com/auth/drive.file"]
      });
    }
  }

  throw new Error("No valid Google Authentication found (OAuth2 or Service Account)");
};

export * from "./drive";
export * from "./admin";
export * from "./WorkspaceAdminService";
export * from './services/places';
