import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getIdeasoftProductById } from "@/src/services/ideasoft";
import ProductEditForm from "./ProductEditForm";
import Link from "next/link";
import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

export default async function UrunEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const product = await getIdeasoftProductById(Number(id));

  if (!product) {
    notFound();
  }

  // Veriyi sterilize et
  const safeProduct = JSON.parse(JSON.stringify(product));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <ProductEditForm product={safeProduct} />
    </div>
  );
}
