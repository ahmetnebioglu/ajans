import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { unsecured_prisma as prisma } from "@ajans/db";

/**
 * GET /api/settings/users
 * Workspace'e ait kullanıcıları listeler.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.currentWorkspaceId) {
      return NextResponse.json(
        { error: "Aktif çalışma alanı bulunamadı." },
        { status: 401 }
      );
    }

    const users = await prisma.workspaceUser.findMany({
      where: { workspaceId: session.user.currentWorkspaceId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("[Users GET Error]:", error);
    return NextResponse.json(
      { error: "Kullanıcılar alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/settings/users
 * Workspace'e kullanıcı davet eder (mevcut hesabı olan). SQL Transaction kullanır.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.currentWorkspaceId) {
      return NextResponse.json(
        { error: "Aktif çalışma alanı bulunamadı." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { email, roleId } = body;

    if (!email) {
      return NextResponse.json(
        { error: "E-posta adresi zorunludur." },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Kullanıcıyı bul
      const targetUser = await tx.user.findUnique({
        where: { email: email.trim().toLowerCase() },
      });

      if (!targetUser) {
        throw new Error("USER_NOT_FOUND");
      }

      // Zaten workspace'te mi kontrol et
      const existing = await tx.workspaceUser.findUnique({
        where: {
          userId_workspaceId: {
            userId: targetUser.id,
            workspaceId: session.user.currentWorkspaceId!,
          },
        },
      });

      if (existing) {
        throw new Error("ALREADY_MEMBER");
      }

      // Rol varsa doğrula
      if (roleId) {
        const role = await tx.workspaceRole.findFirst({
          where: {
            id: roleId,
            workspaceId: session.user.currentWorkspaceId!,
          },
        });
        if (!role) {
          throw new Error("ROLE_NOT_FOUND");
        }
      }

      // Workspace'e ekle
      return tx.workspaceUser.create({
        data: {
          userId: targetUser.id,
          workspaceId: session.user.currentWorkspaceId!,
          roleId: roleId || null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
            },
          },
          role: {
            select: { id: true, name: true },
          },
        },
      });
    });

    return NextResponse.json(
      {
        success: true,
        user: result,
        message: "Kullanıcı başarıyla eklendi.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error?.message === "USER_NOT_FOUND") {
      return NextResponse.json(
        { error: "Bu e-posta adresine sahip bir kullanıcı bulunamadı. Kullanıcının önce sisteme kayıt olması gerekiyor." },
        { status: 404 }
      );
    }
    if (error?.message === "ALREADY_MEMBER") {
      return NextResponse.json(
        { error: "Bu kullanıcı zaten bu çalışma alanında mevcut." },
        { status: 409 }
      );
    }
    if (error?.message === "ROLE_NOT_FOUND") {
      return NextResponse.json(
        { error: "Seçilen rol bulunamadı." },
        { status: 404 }
      );
    }
    console.error("[Users POST Error]:", error);
    return NextResponse.json(
      { error: "Kullanıcı eklenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/settings/users
 * Kullanıcının rolünü günceller. SQL Transaction kullanır.
 */
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.currentWorkspaceId) {
      return NextResponse.json(
        { error: "Aktif çalışma alanı bulunamadı." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { workspaceUserId, roleId } = body;

    if (!workspaceUserId) {
      return NextResponse.json(
        { error: "Kullanıcı ID gerekli." },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const wu = await tx.workspaceUser.findFirst({
        where: {
          id: workspaceUserId,
          workspaceId: session.user.currentWorkspaceId!,
        },
      });

      if (!wu) {
        throw new Error("WORKSPACE_USER_NOT_FOUND");
      }

      return tx.workspaceUser.update({
        where: { id: workspaceUserId },
        data: { roleId: roleId || null },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
            },
          },
          role: {
            select: { id: true, name: true },
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      user: result,
      message: "Kullanıcı rolü güncellendi.",
    });
  } catch (error: any) {
    if (error?.message === "WORKSPACE_USER_NOT_FOUND") {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı." },
        { status: 404 }
      );
    }
    console.error("[Users PUT Error]:", error);
    return NextResponse.json(
      { error: "Güncelleme sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/settings/users
 * Kullanıcıyı workspace'ten çıkarır. SQL Transaction kullanır.
 */
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.currentWorkspaceId) {
      return NextResponse.json(
        { error: "Aktif çalışma alanı bulunamadı." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const workspaceUserId = searchParams.get("id");

    if (!workspaceUserId) {
      return NextResponse.json(
        { error: "Kullanıcı ID gerekli." },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      const wu = await tx.workspaceUser.findFirst({
        where: {
          id: workspaceUserId,
          workspaceId: session.user.currentWorkspaceId!,
        },
      });

      if (!wu) {
        throw new Error("WORKSPACE_USER_NOT_FOUND");
      }

      // Kendini çıkaramaz
      if (wu.userId === session.user.id) {
        throw new Error("CANNOT_REMOVE_SELF");
      }

      await tx.workspaceUser.delete({ where: { id: workspaceUserId } });
    });

    return NextResponse.json({
      success: true,
      message: "Kullanıcı workspace'ten çıkarıldı.",
    });
  } catch (error: any) {
    if (error?.message === "WORKSPACE_USER_NOT_FOUND") {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı." },
        { status: 404 }
      );
    }
    if (error?.message === "CANNOT_REMOVE_SELF") {
      return NextResponse.json(
        { error: "Kendinizi çalışma alanından çıkaramazsınız." },
        { status: 403 }
      );
    }
    console.error("[Users DELETE Error]:", error);
    return NextResponse.json(
      { error: "Kullanıcı çıkarılırken bir hata oluştu." },
      { status: 500 }
    );
  }
}
