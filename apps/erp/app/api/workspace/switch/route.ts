import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { unsecured_prisma as prisma } from "@ajans/db";

/**
 * POST /api/workspace/switch
 * Aktif workspace'i değiştirir. Kullanıcının hedef workspace'te üyesi olduğunu doğrular.
 * Yeni workspace'in permissions bilgisini döndürür.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum bulunamadı." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { workspaceId } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID gerekli." },
        { status: 400 }
      );
    }

    // Kullanıcının bu workspace'te üyesi olduğunu doğrula
    const workspaceUser = await prisma.workspaceUser.findUnique({
      where: {
        userId_workspaceId: {
          userId: session.user.id,
          workspaceId,
        },
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            tenantId: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            permissions: true,
          },
        },
      },
    });

    if (!workspaceUser) {
      return NextResponse.json(
        { error: "Bu çalışma alanına erişiminiz yok." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      currentWorkspaceId: workspaceUser.workspaceId,
      tenantId: workspaceUser.workspace.tenantId,
      workspaceName: workspaceUser.workspace.name,
      permissions: workspaceUser.role?.permissions || [],
      roleName: workspaceUser.role?.name || null,
    });
  } catch (error) {
    console.error("[Workspace Switch Error]:", error);
    return NextResponse.json(
      { error: "Workspace değiştirme sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
