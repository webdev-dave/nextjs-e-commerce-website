"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/formatters";
import { isS3Path } from "@/lib/s3.js";
import { getImageUrl } from "@/lib/getImageUrl";
import { useActionState, useState, useEffect } from "react";
import { addProduct, updateProduct } from "../../_actions/products";
import { useFormStatus } from "react-dom";
import { Product } from "@prisma/client";
import Image from "next/image";

export function ProductForm({ product }: { product?: Product | null }) {
  const [error, action] = useActionState(
    product == null ? addProduct : updateProduct.bind(null, product.id),
    {}
  );
  const [priceInCents, setPriceInCents] = useState<string>(
    product?.priceInCents?.toString() || ""
  );
  const [imageHovered, setImageHovered] = useState(false);
  const [fileHovered, setFileHovered] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [s3ImageUrl, setS3ImageUrl] = useState<string | null>(null);

  // Handle S3 image paths
  useEffect(() => {
    if (product?.imagePath && isS3Path(product.imagePath)) {
      // Use our getImageUrl utility instead of manually constructing the URL
      const fetchImageUrl = async () => {
        try {
          const url = await getImageUrl(product.imagePath);
          setS3ImageUrl(url);
        } catch (error) {
          console.error("Error fetching S3 image URL:", error);
        }
      };

      fetchImageUrl();
    } else if (product?.imagePath) {
      // Local image path
      setImagePreview(product.imagePath);
    }
  }, [product?.imagePath]);

  useEffect(() => {
    return () => {
      // Clean up the URL object when component unmounts
      if (
        imagePreview &&
        imagePreview !== product?.imagePath &&
        !isS3Path(imagePreview)
      ) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview, product?.imagePath]);

  return (
    <form
      action={action}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          type="text"
          id="name"
          name="name"
          defaultValue={product?.name}
          required
        />
        {error.name && <div className="text-destructive">{error.name}</div>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="price">
          Price - {formatCurrency(Number(priceInCents) / 100)}
        </Label>
        <Input
          id="price"
          name="priceInCents"
          type="number"
          min={0}
          step={1}
          value={priceInCents}
          onChange={(e) => setPriceInCents(e.target.value)}
          required
        />
        {error.priceInCents && (
          <div className="text-destructive">{error.priceInCents}</div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={product?.description}
          required
        />
        {error.description && (
          <div className="text-destructive">{error.description}</div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="image">Image</Label>
        {product?.imagePath && (
          <div className="mb-2">
            <p className="text-sm text-muted-foreground">
              Current file:{" "}
              {isS3Path(product.imagePath)
                ? product.imagePath.split("/").pop()
                : product.imagePath.split("/").pop()}
            </p>
          </div>
        )}
        {imagePreview && (
          <Image
            src={imagePreview}
            height="100"
            width="100"
            alt="Product Image"
          />
        )}
        {s3ImageUrl && !imagePreview && (
          <Image
            src={s3ImageUrl}
            height="100"
            width="100"
            alt="Product Image"
          />
        )}
        <Input
          type="file"
          id="image"
          name="image"
          required={product == null}
          className="file:cursor-pointer cursor-pointer"
          onMouseEnter={() => setImageHovered(true)}
          onMouseLeave={() => setImageHovered(false)}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const url = URL.createObjectURL(file);
              setImagePreview(url);
              setS3ImageUrl(null); // Clear S3 URL when a new file is selected
            }
          }}
        />
        {imageHovered && product?.imagePath && (
          <p className="text-sm text-destructive transition-colors">
            Only upload a new image if you want to overwrite the current one.
          </p>
        )}
        
        {error.image && <div className="text-destructive">{error.image}</div>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="file">File</Label>
        {product?.filePath && (
          <div className="mb-2">
            <p className="text-sm text-muted-foreground">
              Current file:{" "}
              {isS3Path(product.filePath)
                ? product.filePath.split("/").pop()
                : product.filePath.split("/").pop()}
            </p>
          </div>
        )}
        <div className="flex flex-col gap-1">
          <Input
            type="file"
            id="file"
            name="file"
            required={product == null}
            className="file:cursor-pointer cursor-pointer"
            onMouseEnter={() => setFileHovered(true)}
            onMouseLeave={() => setFileHovered(false)}
          />
          {fileHovered && product?.filePath && (
            <p className="text-sm text-destructive transition-colors">
              Only upload a new file if you want to overwrite the current one.
            </p>
          )}
        </div>
        {error.file && <div className="text-destructive">{error.file}</div>}
      </div>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending}>{pending ? "Saving..." : "Save Product"}</Button>
  );
}
