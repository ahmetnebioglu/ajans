import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { unsecured_prisma as prisma } from "@ajans/db";
import { ADMIN_PERMISSIONS } from "@ajans/auth/permissions";

/**
 * POST /api/onboarding
 * Kayıt sonrası ilk workspace oluşturma.
 * Session'dan userId alır, workspace + admin rolü + workspace user oluşturur.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum bulunamadı. Lütfen giriş yapın." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { workspaceName } = body;

    if (!workspaceName || workspaceName.trim().length < 2) {
      return NextResponse.json(
        { error: "Çalışma alanı adı en az 2 karakter olmalıdır." },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Kullanıcının zaten bir workspace'i var mı kontrol et
    const existingWorkspaceUser = await prisma.workspaceUser.findFirst({
      where: { userId },
    });

    if (existingWorkspaceUser) {
      return NextResponse.json(
        { error: "Zaten bir çalışma alanınız mevcut." },
        { status: 409 }
      );
    }

    // SQL Transaction: Workspace + Admin Role + WorkspaceUser oluştur
    const result = await prisma.$transaction(async (tx) => {
      // 1. Workspace oluştur
      const workspace = await tx.workspace.create({
        data: {
          name: workspaceName.trim(),
          createdById: userId,
          activeModules: ["DRIVE", "CMS", "HR", "CRM"],
          status: "ACTIVE",
        },
      });

      // 2. Admin rolü oluştur (tüm izinlerle)
      const adminRole = await tx.workspaceRole.create({
        data: {
          name: "Admin",
          workspaceId: workspace.id,
          permissions: [...ADMIN_PERMISSIONS],
          isDefault: true,
        },
      });

      // 3. Kullanıcıyı workspace'e Admin olarak ata
      const workspaceUser = await tx.workspaceUser.create({
        data: {
          userId,
          workspaceId: workspace.id,
          roleId: adminRole.id,
        },
      });

      // 4. Kullanıcının tenantId'sini ve rolünü güncelle
      await tx.user.update({
        where: { id: userId },
        data: {
          tenantId: workspace.tenantId,
          role: "ADMIN",
        },
      });

      return {
        workspace,
        adminRole,
        workspaceUser,
      };
    });

    return NextResponse.json(
      {
        success: true,
        workspaceId: result.workspace.id,
        tenantId: result.workspace.tenantId,
        message: "Çalışma alanı başarıyla oluşturuldu.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Onboarding API Error]:", error);
    return NextResponse.json(
      { error: "Çalışma alanı oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
}
