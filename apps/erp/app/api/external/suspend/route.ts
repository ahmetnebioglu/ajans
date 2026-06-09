import { NextResponse } from "next/server";
import { z } from "zod";
import {
  requireExternalAuth,
  unauthorizedResponse,
  badRequestResponse,
} from "@/lib/external";
import { unsecured_prisma as prisma } from "@ajans/db";

const suspendSchema = z.object({
  workspaceId: z.string().trim().min(1),
  reason: z.string().trim().optional(),
});

export async function POST(req: Request) {
  const auth = await requireExternalAuth(req);
  if (!auth) {
    return unauthorizedResponse();
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequestResponse("Geçersiz JSON gövdesi.");
  }

  const parsed = suspendSchema.safeParse(body);
  if (!parsed.success) {
    return badRequestResponse(
      parsed.error.errors.map((err) => err.message).join(" "),
    );
  }

  const { workspaceId, reason } = parsed.data;
  const company = await prisma.workspace.findUnique({ where: { id: workspaceId } });

  if (!company) {
    return NextResponse.json({ error: "Şirket bulunamadı." }, { status: 404 });
  }

  try {
    await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        status: "PASSIVE",
      },
    });

    const disabledCount = await prisma.user.count({
      where: { tenantId: workspaceId },
    });

    return NextResponse.json({
      success: true,
      workspaceId,
      status: "PASSIVE",
      affectedUsers: disabledCount,
      reason: reason || null,
    });
  } catch (error: any) {
    console.error("Suspend error:", error);
    return NextResponse.json(
      { error: error.message || "Suspend failed." },
      { status: 500 },
    );
  }
}
