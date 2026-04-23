import { Readable } from "stream";
import { google } from "googleapis";
import { getGoogleAuth } from "./index";

export async function uploadToDrive(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  folderId?: string
) {
  const auth = getGoogleAuth();
  const drive = google.drive({ version: "v3", auth });

  console.log(`[Drive] Attempting RESUMABLE upload for ${fileName} to folder ${folderId}`);
  
  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: folderId ? [folderId] : [],
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
