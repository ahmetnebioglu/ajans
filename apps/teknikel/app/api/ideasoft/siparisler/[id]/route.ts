import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { updateIdeasoftOrderStatus } from "@/src/services/ideasoft";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(
      JSON.stringify({ success: false, message: "Unauthorized" }),
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { status, trackingNumber } = body;

    if (!status) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Status is required",
        }),
        { status: 400 }
      );
    }

    const result = await updateIdeasoftOrderStatus(
      Number(id),
      status,
      trackingNumber
    );

    if (!result) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to update order status",
        }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
        message: "Order status updated successfully",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating order status:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500 }
    );
  }
}
