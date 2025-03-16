"use client";

import { formatCurrency } from "@/lib/formatters";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";
import { getImageUrl } from "@/lib/getImageUrl";
import { useEffect, useState } from "react";

type ProductCardProps = {
  id: string;
  name: string;
  priceInCents: number;
  description: string;
  imagePath: string;
};

export function ProductCard({
  id,
  name,
  priceInCents,
  description,
  imagePath,
}: ProductCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      try {
        setIsLoading(true);
        setImageError(false);
        const url = await getImageUrl(imagePath);
        setImageUrl(url);
      } catch (error) {
        console.error("Error loading image:", error);
        setImageError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [imagePath]);

  return (
    <Card className="flex overflow-hidden flex-col">
      <div className="relative w-full h-auto aspect-video">
        {isLoading ? (
          <div className="w-full h-full bg-gray-200 animate-pulse" />
        ) : imageUrl && !imageError ? (
          <Image
            src={imageUrl}
            fill
            alt={name}
            className="object-cover"
            onError={() => setImageError(true)}
            unoptimized={true}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">Image not available</span>
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{formatCurrency(priceInCents / 100)}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="line-clamp-4">{description}</p>
      </CardContent>
      <CardFooter>
        <Button
          asChild
          size="lg"
          className="w-full"
        >
          <Link href={`/products/${id}/purchase`}>Purchase</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden flex flex-col animate-pulse">
      <div className="w-full aspect-video bg-gray-300" />
      <CardHeader>
        <CardTitle>
          <div className="w-3/4 h-6 rounded-full bg-gray-300" />
        </CardTitle>
        <CardDescription>
          <div className="w-1/2 h-4 rounded-full bg-gray-300" />
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="w-full h-4 rounded-full bg-gray-300" />
        <div className="w-full h-4 rounded-full bg-gray-300" />
        <div className="w-3/4 h-4 rounded-full bg-gray-300" />
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          disabled
          size="lg"
        ></Button>
      </CardFooter>
    </Card>
  );
}
