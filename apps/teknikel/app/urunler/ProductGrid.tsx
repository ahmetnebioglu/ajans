'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Input, Select, Pagination, Button, Space, Empty } from 'antd';
import {
  ShoppingOutlined,
  SortAscendingOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface IdeasoftProduct {
  id: number;
  name: string;
  sku: string;
  barcode?: string;
  price1: number;
  price2?: number;
  price3?: number;
  tax: number;
  taxIncluded?: boolean;
  stockAmount: number;
  stockTypeLabel?: string;
  brand?: { name: string };
  categories?: Array<{ name: string }>;
  images?: Array<{ thumbUrl: string; originalUrl: string }>;
  detail?: { details?: string; extraDetails?: string };
  createdAt?: string;
  updatedAt?: string;
}

interface ProductGridProps {
  initialData: IdeasoftProduct[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  searchTerm: string;
  sort: string;
}

const formatPrice = (price: number | null | undefined) => {
  if (price == null) return '-';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(price);
};

const getStockStatus = (stock: number) => {
  if (stock <= 0) return { color: 'error', label: 'Tükendi' };
  if (stock <= 5) return { color: 'warning', label: 'Kritik' };
  return { color: 'success', label: 'Stokta' };
};

const sortOptions = [
  { value: '-id', label: 'En Yeniler' },
  { value: 'id', label: 'En Eskiler' },
  { value: '-price1', label: 'Fiyat (Pahalı-Ucuz)' },
  { value: 'price1', label: 'Fiyat (Ucuz-Pahalı)' },
  { value: '-stockAmount', label: 'Stok (Çok-Az)' },
  { value: 'stockAmount', label: 'Stok (Az-Çok)' },
  { value: 'name', label: 'İsim (A-Z)' },
  { value: '-name', label: 'İsim (Z-A)' },
];

export default function ProductGrid({
  initialData,
  totalCount,
  currentPage,
  totalPages,
  searchTerm,
  sort,
}: ProductGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = React.useState(false);

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('s', value);
      params.set('page', '1');
    } else {
      params.delete('s');
      params.set('page', '1');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleRefresh = () => {
    setLoading(true);
    router.refresh();
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="space-y-4">
      {/* Arama ve Filtreler */}
      <Card className="shadow-sm border-slate-100 dark:border-slate-800">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Input.Search
              placeholder="Ürün kodu ile ara..."
              onSearch={handleSearch}
              defaultValue={searchTerm}
              allowClear
              enterButton
              className="flex-1 min-w-[250px]"
            />
            <Select
              value={sort}
              onChange={handleSortChange}
              options={sortOptions}
              className="w-[200px]"
              prefix={<SortAscendingOutlined />}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
            >
              Yenile
            </Button>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Toplam <strong>{totalCount}</strong> ürün
            {searchTerm && <span> • "{searchTerm}" araması</span>}
          </div>
        </div>
      </Card>

      {/* Ürün Grid */}
      {initialData.length === 0 ? (
        <Card className="shadow-sm border-slate-100 dark:border-slate-800">
          <Empty
            description="Ürün bulunamadı"
            style={{ marginTop: 48, marginBottom: 48 }}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {initialData.map((product) => {
            const stockStatus = getStockStatus(product.stockAmount);
            const defaultImage = '/default.webp';
            const imageUrl =
              product.images && product.images.length > 0
                ? product.images[0].thumbUrl
                : defaultImage;

            return (
              <Link
                key={product.id}
                href={`/urunler/${product.id}`}
                className="group"
              >
                <Card
                  hoverable
                  className="h-full shadow-sm border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow"
                  cover={
                    <div className="bg-slate-50 dark:bg-slate-800 h-40 flex items-center justify-center overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="h-full w-full object-contain p-2 group-hover:scale-105 transition-transform"
                      />
                    </div>
                  }
                >
                  <div className="space-y-2">
                    <div>
                      <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 line-clamp-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono mt-1">
                        {product.sku}
                      </p>
                    </div>

                    {product.brand && (
                      <p className="text-xs text-slate-500">
                        {product.brand.name}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                      <div>
                        <p className="text-xs text-slate-500">Fiyat</p>
                        <p className="font-bold text-primary">
                          {formatPrice(product.price1)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Stok</p>
                        <p
                          className={`font-bold text-sm ${
                            stockStatus.color === 'error'
                              ? 'text-rose-500'
                              : stockStatus.color === 'warning'
                              ? 'text-amber-500'
                              : 'text-emerald-600'
                          }`}
                        >
                          {product.stockAmount}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="flex justify-center py-6">
          <Pagination
            current={currentPage}
            total={totalCount}
            pageSize={30}
            onChange={handlePageChange}
            showSizeChanger={false}
            showTotal={(total) => `Toplam ${total} ürün`}
          />
        </div>
      )}
    </div>
  );
}
