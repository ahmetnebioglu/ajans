import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const path = request.nextUrl.searchParams.get("path");

  // Güvenlik: Sadece doğru secret'a sahip istekler kabul edilir
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Yetkisiz işlem (Invalid secret)" }, { status: 401 });
  }

  if (!path) {
    return NextResponse.json({ message: "Path parametresi zorunludur" }, { status: 400 });
  }

  try {
    revalidatePath(path);
    return NextResponse.json({ revalidated: true, path, timestamp: Date.now() });
  } catch (err) {
    return NextResponse.json({ message: "Revalidation hatası" }, { status: 500 });
  }
}
