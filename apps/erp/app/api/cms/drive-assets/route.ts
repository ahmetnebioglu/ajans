import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listTenantFiles } from "@ajans/core";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userRole = ((session?.user as any)?.role || "").toUpperCase();
  if (!session || userRole !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const tenantId = (session?.user as any)?.tenantId || "mercan";
    const files = await listTenantFiles(tenantId, "cms");

    return NextResponse.json({ success: true, files });
  } catch (error) {
    console.error("R2 assets fetch error:", error);
    return NextResponse.json({ success: true, files: [] });
  }
}
