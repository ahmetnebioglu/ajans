import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Ödeme yönetimi uç noktası hazır.",
    payments: [],
  });
}

export async function POST(request: Request) {
  const payload = await request.json();

  return NextResponse.json({
    message: "Ödeme isteği alındı.",
    request: payload,
  });
}
