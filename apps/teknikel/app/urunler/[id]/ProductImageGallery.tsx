"use client";

import { Image } from "antd";
import { ShoppingOutlined } from "@ant-design/icons";

interface ProductImage {
  originalUrl?: string;
  thumbUrl?: string;
}

interface ProductImageGalleryProps {
  images: ProductImage[] | undefined;
  productName: string;
  defaultImage: string;
}

export default function ProductImageGallery({
  images,
  productName,
  defaultImage,
}: ProductImageGalleryProps) {
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
        <ShoppingOutlined style={{ fontSize: 48 }} className="text-slate-400" />
      </div>
    );
  }

  return (
    <Image.PreviewGroup>
      <div className="space-y-4">
        <Image
          src={images[0].originalUrl || defaultImage}
          alt={productName}
          className="w-full h-auto rounded-lg"
          fallback={defaultImage}
        />
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {images.map((img, idx) => (
              <Image
                key={idx}
                src={img.thumbUrl || defaultImage}
                alt={`${productName} - ${idx + 1}`}
                className="w-20 h-20 object-contain rounded cursor-pointer flex-shrink-0"
                fallback={defaultImage}
              />
            ))}
          </div>
        )}
      </div>
    </Image.PreviewGroup>
  );
}
