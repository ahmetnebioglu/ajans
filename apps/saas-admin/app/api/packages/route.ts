import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Paket listesi uç noktası hazır.",
    packages: [],
  });
}

export async function POST(request: Request) {
  const payload = await request.json();

  return NextResponse.json({
    message: "Yeni paket kaydı alındı.",
    payload,
  });
}
