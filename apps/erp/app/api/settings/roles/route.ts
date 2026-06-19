import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { unsecured_prisma as prisma } from "@ajans/db";

/**
 * GET /api/settings/roles
 * Workspace'e ait rolleri listeler.
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

    const roles = await prisma.workspaceRole.findMany({
      where: { workspaceId: session.user.currentWorkspaceId },
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ roles });
  } catch (error) {
    console.error("[Roles GET Error]:", error);
    return NextResponse.json(
      { error: "Roller alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/settings/roles
 * Yeni rol oluşturur. SQL Transaction kullanır.
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
    const { name, permissions } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Rol adı en az 2 karakter olmalıdır." },
        { status: 400 }
      );
    }

    if (!Array.isArray(permissions)) {
      return NextResponse.json(
        { error: "İzinler bir dizi olmalıdır." },
        { status: 400 }
      );
    }

    const role = await prisma.$transaction(async (tx) => {
      // Aynı isimde rol var mı kontrol et
      const existing = await tx.workspaceRole.findUnique({
        where: {
          workspaceId_name: {
            workspaceId: session.user.currentWorkspaceId!,
            name: name.trim(),
          },
        },
      });

      if (existing) {
        throw new Error("DUPLICATE_ROLE");
      }

      return tx.workspaceRole.create({
        data: {
          name: name.trim(),
          workspaceId: session.user.currentWorkspaceId!,
          permissions,
        },
      });
    });

    return NextResponse.json(
      { success: true, role, message: "Rol başarıyla oluşturuldu." },
      { status: 201 }
    );
  } catch (error: any) {
    if (error?.message === "DUPLICATE_ROLE") {
      return NextResponse.json(
        { error: "Bu isimde bir rol zaten mevcut." },
        { status: 409 }
      );
    }
    console.error("[Roles POST Error]:", error);
    return NextResponse.json(
      { error: "Rol oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/settings/roles
 * Mevcut rolü günceller. SQL Transaction kullanır.
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
    const { id, name, permissions } = body;

    if (!id) {
      return NextResponse.json({ error: "Rol ID gerekli." }, { status: 400 });
    }

    const role = await prisma.$transaction(async (tx) => {
      // Rolün bu workspace'e ait olduğunu doğrula
      const existing = await tx.workspaceRole.findFirst({
        where: {
          id,
          workspaceId: session.user.currentWorkspaceId!,
        },
      });

      if (!existing) {
        throw new Error("ROLE_NOT_FOUND");
      }

      return tx.workspaceRole.update({
        where: { id },
        data: {
          ...(name ? { name: name.trim() } : {}),
          ...(permissions ? { permissions } : {}),
        },
      });
    });

    return NextResponse.json({
      success: true,
      role,
      message: "Rol güncellendi.",
    });
  } catch (error: any) {
    if (error?.message === "ROLE_NOT_FOUND") {
      return NextResponse.json(
        { error: "Rol bulunamadı." },
        { status: 404 }
      );
    }
    console.error("[Roles PUT Error]:", error);
    return NextResponse.json(
      { error: "Rol güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/settings/roles
 * Rolü siler. SQL Transaction kullanır.
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
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Rol ID gerekli." }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      const existing = await tx.workspaceRole.findFirst({
        where: {
          id,
          workspaceId: session.user.currentWorkspaceId!,
        },
        include: { _count: { select: { users: true } } },
      });

      if (!existing) {
        throw new Error("ROLE_NOT_FOUND");
      }

      if (existing._count.users > 0) {
        throw new Error("ROLE_IN_USE");
      }

      await tx.workspaceRole.delete({ where: { id } });
    });

    return NextResponse.json({
      success: true,
      message: "Rol silindi.",
    });
  } catch (error: any) {
    if (error?.message === "ROLE_NOT_FOUND") {
      return NextResponse.json(
        { error: "Rol bulunamadı." },
        { status: 404 }
      );
    }
    if (error?.message === "ROLE_IN_USE") {
      return NextResponse.json(
        { error: "Bu rol kullanıcılara atanmış. Önce kullanıcıları farklı bir role taşıyın." },
        { status: 409 }
      );
    }
    console.error("[Roles DELETE Error]:", error);
    return NextResponse.json(
      { error: "Rol silinirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
