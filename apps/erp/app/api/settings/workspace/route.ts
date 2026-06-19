import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { unsecured_prisma as prisma } from "@ajans/db";

/**
 * GET /api/settings/workspace
 * Aktif workspace bilgilerini döndürür.
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

    const workspace = await prisma.workspace.findUnique({
      where: { id: session.user.currentWorkspaceId },
      include: {
        _count: {
          select: {
            users: true,
            roles: true,
          },
        },
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Çalışma alanı bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({ workspace });
  } catch (error) {
    console.error("[Workspace GET Error]:", error);
    return NextResponse.json(
      { error: "Veri alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/settings/workspace
 * Workspace bilgilerini günceller. SQL Transaction kullanır.
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
    const { name, address, taxNumber, taxOffice, phone } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Çalışma alanı adı en az 2 karakter olmalıdır." },
        { status: 400 }
      );
    }

    const workspace = await prisma.$transaction(async (tx) => {
      return tx.workspace.update({
        where: { id: session.user.currentWorkspaceId! },
        data: {
          name: name.trim(),
          address: address?.trim() || null,
          taxNumber: taxNumber?.trim() || null,
          taxOffice: taxOffice?.trim() || null,
          phone: phone?.trim() || null,
        },
      });
    });

    return NextResponse.json({
      success: true,
      workspace,
      message: "Çalışma alanı güncellendi.",
    });
  } catch (error) {
    console.error("[Workspace PUT Error]:", error);
    return NextResponse.json(
      { error: "Güncelleme sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
