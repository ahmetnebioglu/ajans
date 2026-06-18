import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  requireExternalAuth,
  unauthorizedResponse,
  badRequestResponse,
} from "@/lib/external";
import { unsecured_prisma as prisma } from "@ajans/db";

const provisionSchema = z.object({
  companyName: z.string().trim().min(2),
  email: z.string().trim().email(),
  name: z.string().trim().min(2),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  taxNumber: z.string().trim().optional(),
  taxOffice: z.string().trim().optional(),
  driveFolderId: z.string().trim().optional(),
  password: z.string().min(8).optional(),
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

  const parsed = provisionSchema.safeParse(body);
  if (!parsed.success) {
    return badRequestResponse(
      parsed.error.errors.map((err) => err.message).join(" "),
    );
  }

  const {
    companyName,
    email,
    name,
    phone,
    address,
    taxNumber,
    taxOffice,
    password,
  } = parsed.data;

  const normalizedEmail = email.toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "Bu e-posta adresiyle kayıtlı bir kullanıcı zaten var." },
      { status: 400 },
    );
  }

  const workspaceId = crypto.randomUUID();

  const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

  try {
    const company = await prisma.workspace.create({
      data: {
        id: workspaceId,
        name: companyName,
        address: address || undefined,
        taxNumber: taxNumber || undefined,
        taxOffice: taxOffice || undefined,
        phone: phone || undefined,
        tenantId: workspaceId,
      },
    });

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name,
        role: "ADMIN",
        tenantId: company.id,
        password: hashedPassword || undefined,
      },
    });

    await prisma.folder.create({
      data: {
        name: "Varsayılan Klasör",
        workspaceId: company.id,
        tenantId: company.id,
      },
    });

    await prisma.workspaceUser.create({
      data: {
        userId: user.id,
        workspaceId: company.id,
      },
    });

    return NextResponse.json({
      success: true,
      workspaceId: company.id,
      tenantId: company.id,
      adminUserId: user.id,
      adminEmail: user.email,
    });
  } catch (error: any) {
    console.error("Provision error:", error);
    return NextResponse.json(
      { error: error.message || "Provision failed." },
      { status: 500 },
    );
  }
}
