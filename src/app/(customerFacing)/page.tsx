import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import db from "@/db/db";
import { Product } from "@prisma/client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

async function getMostPopularProducts() {
  return db.product.findMany({
    where: {
      isAvailableForPurchase: true,
    },
    orderBy: {
      orders: {
        _count: "desc",
      },
    },
  });
}

async function getNewestProducts() {
  return db.product.findMany({
    where: {
      isAvailableForPurchase: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export default async function HomePage() {
  return (
    <div className="space-y-12">
      <ProductGridSection
        title="Most Popular"
        productsFetcher={getMostPopularProducts}
      />
      <ProductGridSection
        title="Newest"
        productsFetcher={getNewestProducts}
      />
    </div>
  );
}

type ProductGridSectionProps = {
  title: string;
  productsFetcher: () => Promise<Product[]>;
};

function ProductGridSection({
  title,
  productsFetcher,
}: ProductGridSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <h2 className="text-3xl font-bold">{title}</h2>
        <Button
          variant="outline"
          asChild
        >
          <Link
            href="/products"
            className="space-x-2"
          >
            <span>View All</span>
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        <Suspense
          fallback={
            <>
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </>
          }
        >
          <ProductSuspense productsFetcher={productsFetcher} />
        </Suspense>
      </div>
    </div>
  );
}

async function ProductSuspense({
  productsFetcher,
}: {
  productsFetcher: () => Promise<Product[]>;
}) {
  return (await productsFetcher()).map((product) => (
    <ProductCard
      key={product.id}
      {...product}
    />
  ));
}
