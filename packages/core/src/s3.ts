import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

// Initialise the client
// To support both Cloudflare R2 and AWS S3, we check the environment variables.
// Since all tenants share the same bucket, we can load these globally from process.env.
let endpoint = process.env.CLOUDFLARE_R2_ENDPOINT || process.env.S3_ENDPOINT;
let bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || process.env.S3_BUCKET_NAME || "";

const cloudflareUrl = process.env.cloudflare;
if (cloudflareUrl && (!endpoint || !bucketName)) {
  try {
    const url = new URL(cloudflareUrl);
    endpoint = url.origin;
    // Extract bucket name from path (e.g. /ajans-erp -> ajans-erp)
    bucketName = url.pathname.replace(/^\/+|\/+$/g, "");
    console.log(`[S3/R2 Client] Parsed from process.env.cloudflare - Endpoint: ${endpoint}, Bucket: ${bucketName}`);
  } catch (e) {
    console.error("[S3/R2 Client] Error parsing cloudflare URL:", e);
  }
}

const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY;
const publicDomain = process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN || process.env.S3_PUBLIC_DOMAIN || process.env.r2publicUrl || "";

let s3Client: S3Client | null = null;

if (endpoint && accessKeyId && secretAccessKey) {
  s3Client = new S3Client({
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    region: "auto",
  });
} else {
  console.warn("[S3/R2 Client] Missing credentials. S3 uploads will fall back to mock URLs.");
}

/**
 * Uploads a file to S3/R2 under the tenant-isolated key:
 * `{tenantId}/{folder}/{timestamp}_{fileName}`
 * 
 * @returns Object containing key and URL
 */
export async function uploadFile(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  tenantId: string,
  folder?: string
): Promise<{ key: string; url: string }> {
  // Enforce clean tenantId
  const cleanTenant = tenantId.trim().replace(/\/+$/, "");
  const cleanFolder = folder ? folder.trim().replace(/^\/+|\/+$/g, "") : "";
  
  // Make filename URL safe / unique to avoid overwriting
  const cleanFileName = fileName.replace(/\s+/g, "_");
  const uniqueFileName = `${Date.now()}_${cleanFileName}`;
  
  // Construct the S3 Key: tenantId/folder/uniqueFileName or tenantId/uniqueFileName
  const s3Key = cleanFolder 
    ? `${cleanTenant}/${cleanFolder}/${uniqueFileName}`
    : `${cleanTenant}/${uniqueFileName}`;

  if (!s3Client) {
    console.log(`[S3/R2 Mock] Uploading ${s3Key} (mocked because credentials are not set)`);
    const mockUrl = publicDomain 
      ? `${publicDomain.replace(/\/+$/, "")}/${s3Key}`
      : `https://mock-s3.example.com/${s3Key}`;
    return { key: s3Key, url: mockUrl };
  }

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: mimeType,
    });

    await s3Client.send(command);

    // Construct URL
    const url = publicDomain 
      ? `${publicDomain.replace(/\/+$/, "")}/${s3Key}`
      : `${endpoint.replace(/\/+$/, "")}/${bucketName}/${s3Key}`;

    return { key: s3Key, url };
  } catch (error) {
    console.error("[S3/R2 Client] Upload error:", error);
    throw new Error(`Dosya yükleme hatası: ${(error as any).message}`);
  }
}

/**
 * Deletes a file from S3/R2 using its key
 */
export async function deleteFile(s3Key: string): Promise<boolean> {
  if (!s3Client) {
    console.log(`[S3/R2 Mock] Deleting ${s3Key}`);
    return true;
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error("[S3/R2 Client] Delete error:", error);
    return false;
  }
}

/**
 * Generates the public URL of a file given its key
 */
export function getFileUrl(s3Key: string): string {
  if (!s3Key) return "";
  // If it's already a full URL, return it
  if (s3Key.startsWith("http://") || s3Key.startsWith("https://")) {
    return s3Key;
  }
  
  const domain = publicDomain || `https://${bucketName}.r2.dev`;
  return `${domain.replace(/\/+$/, "")}/${s3Key}`;
}

/**
 * Lists files for a tenant in the S3 bucket under the folder prefix:
 * `{tenantId}/{folder}/`
 */
export async function listTenantFiles(
  tenantId: string,
  folder?: string
): Promise<Array<{
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink: string;
  webViewLink: string;
  size: number;
}>> {
  const cleanTenant = tenantId.trim().replace(/\/+$/, "");
  const cleanFolder = folder ? folder.trim().replace(/^\/+|\/+$/g, "") : "";
  const prefix = cleanFolder 
    ? `${cleanTenant}/${cleanFolder}/`
    : `${cleanTenant}/`;

  if (!s3Client) {
    console.log(`[S3/R2 Mock] Listing files for prefix: ${prefix}`);
    return [];
  }

  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    });

    const response = await s3Client.send(command);
    const contents = response.Contents || [];

    const domain = publicDomain || `https://${bucketName}.r2.dev`;

    return contents.map((item) => {
      const key = item.Key || "";
      const name = key.substring(key.lastIndexOf("/") + 1);
      
      // Basic extension to mimeType mapping
      let mimeType = "application/octet-stream";
      const ext = name.split(".").pop()?.toLowerCase();
      if (ext === "jpg" || ext === "jpeg") mimeType = "image/jpeg";
      else if (ext === "png") mimeType = "image/png";
      else if (ext === "gif") mimeType = "image/gif";
      else if (ext === "webp") mimeType = "image/webp";
      else if (ext === "svg") mimeType = "image/svg+xml";
      else if (ext === "pdf") mimeType = "application/pdf";

      const url = `${domain.replace(/\/+$/, "")}/${key}`;

      return {
        id: key,
        name,
        mimeType,
        thumbnailLink: url,
        webViewLink: url,
        size: item.Size || 0,
      };
    });
  } catch (error) {
    console.error("[S3/R2 Client] List files error:", error);
    return [];
  }
}
