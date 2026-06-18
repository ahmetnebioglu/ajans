import { Readable } from "stream";
import { google } from "googleapis";
import { getGoogleAuth } from "./index";
import { getGoogleSettings } from "./settings";

export async function uploadToDrive(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  folderId?: string,
  tenantId: string = "mercan"
) {
  const auth = await getGoogleAuth(tenantId);
  const settings = await getGoogleSettings(tenantId);
  
  // Eğer folderId parametre olarak gelmediyse DB'den al, o da yoksa ENV'den al
  const targetFolderId = folderId || settings?.googleDriveFolderId || process.env.GOOGLE_DRIVE_FOLDER_ID;

  // Service Account (GoogleAuth) veya OAuth2 desteği için istemciyi al
  const authClient = "getClient" in auth ? await (auth as any).getClient() : auth;
  const drive = google.drive({ version: "v3", auth: authClient });

  console.log(`[Drive] Attempting RESUMABLE upload for ${fileName} to folder ${targetFolderId}`);
  
  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: targetFolderId ? [targetFolderId] : [],
    },
    media: {
      mimeType: mimeType,
      body: Readable.from(fileBuffer),
    },
    fields: "id, webViewLink",
    supportsAllDrives: true,
  }, {
    // This forces gaxios to use resumable upload logic
    onUploadProgress: (evt) => console.log(`Upload Progress: ${evt.bytesRead} bytes`),
  });

  const fileId = response.data.id;
  
  if (fileId) {
    // Make file public
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });
  }

  return response.data;
}
