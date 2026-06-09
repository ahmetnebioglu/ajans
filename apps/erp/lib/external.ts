import { NextResponse } from "next/server";
import { unsecured_prisma as prisma } from "@ajans/db";

const envApiKeys = new Set(
  (process.env.EXTERNAL_API_KEY || "")
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean),
);

export function parseExternalAuthToken(req: Request) {
  const authHeader = req.headers.get("authorization")?.trim();
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }

  return req.headers.get("x-api-key")?.trim() || null;
}

export async function verifyExternalToken(token: string) {
  if (envApiKeys.has(token)) {
    return { type: "env" as const, token };
  }

  const account = await prisma.serviceAccount.findUnique({
    where: { serviceToken: token },
  });

  if (!account) {
    return null;
  }

  return { type: "service-account" as const, account };
}

export async function requireExternalAuth(req: Request) {
  const token = parseExternalAuthToken(req);
  if (!token) {
    return null;
  }

  return verifyExternalToken(token);
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: "Unauthorized. Geçersiz API anahtarı veya Bearer token." },
    { status: 401 },
  );
}

export function badRequestResponse(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}
