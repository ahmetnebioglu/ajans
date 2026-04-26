import { google } from "googleapis";
import { JWT } from "google-auth-library";

/**
 * Google Workspace Admin Yönetim Servisi
 * Domain-Wide Delegation kullanarak domain seviyesinde kullanıcı yönetimi sağlar.
 */
export class WorkspaceAdminService {
  private auth: JWT;
  private admin: any;

  constructor() {
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    const adminEmail = process.env.GOOGLE_ADMIN_EMAIL;

    if (!serviceAccountJson) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON ortam değişkeni ayarlanmamış.");
    }

    if (!adminEmail) {
      throw new Error("GOOGLE_ADMIN_EMAIL ortam değişkeni ayarlanmamış (Domain-wide delegation için gerekli).");
    }

    const credentials = JSON.parse(serviceAccountJson);

    this.auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key?.replace(/\\n/g, '\n'),
      scopes: [
        "https://www.googleapis.com/auth/admin.directory.user",
        "https://www.googleapis.com/auth/admin.directory.group",
        "https://www.googleapis.com/auth/admin.directory.orgunit"
      ],
      subject: adminEmail
    });

    this.admin = google.admin({ version: "directory_v1", auth: this.auth });
  }

  /**
   * Belirtilen domaindeki kullanıcıları listeler.
   */
  async listUsers(domain: string) {
    try {
      const response = await this.admin.users.list({
        domain: domain,
        orderBy: "email",
        maxResults: 500,
      });
      return response.data.users || [];
    } catch (error: any) {
      console.error(`[WorkspaceAdminService] listUsers error for domain ${domain}:`, error.message);
      throw new Error(`Kullanıcı listesi alınamadı: ${error.message}`);
    }
  }

  /**
   * Yeni bir Google Workspace hesabı oluşturur.
   */
  async createUser(userData: {
    primaryEmail: string;
    givenName: string;
    familyName: string;
    password?: string;
  }) {
    try {
      const response = await this.admin.users.insert({
        requestBody: {
          primaryEmail: userData.primaryEmail,
          name: {
            givenName: userData.givenName,
            familyName: userData.familyName,
          },
          password: userData.password || Math.random().toString(36).slice(-10),
          changePasswordAtNextLogin: true,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error(`[WorkspaceAdminService] createUser error:`, error.message);
      throw new Error(`Kullanıcı oluşturulamadı: ${error.message}`);
    }
  }

  /**
   * Hesabı askıya alır.
   */
  async suspendUser(email: string) {
    try {
      const response = await this.admin.users.update({
        userKey: email,
        requestBody: {
          suspended: true,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error(`[WorkspaceAdminService] suspendUser error for ${email}:`, error.message);
      throw new Error(`Hesap askıya alınamadı: ${error.message}`);
    }
  }

  /**
   * Hesabı tekrar aktifleştirir.
   */
  async reactivateUser(email: string) {
    try {
      const response = await this.admin.users.update({
        userKey: email,
        requestBody: {
          suspended: false,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error(`[WorkspaceAdminService] reactivateUser error for ${email}:`, error.message);
      throw new Error(`Hesap aktifleştirilemedi: ${error.message}`);
    }
  }

  /**
   * Parolayı sıfırlar ve ilk girişte değişim zorunlu kılar.
   */
  async resetPassword(email: string, newPassword: string) {
    try {
      const response = await this.admin.users.update({
        userKey: email,
        requestBody: {
          password: newPassword,
          changePasswordAtNextLogin: true,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error(`[WorkspaceAdminService] resetPassword error for ${email}:`, error.message);
      throw new Error(`Parola sıfırlanamadı: ${error.message}`);
    }
  }
}
