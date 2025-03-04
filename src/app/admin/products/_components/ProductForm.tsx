"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/formatters";
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
  const [imagePreview, setImagePreview] = useState<string | null>(
    product?.imagePath || null
  );

  useEffect(() => {
    return () => {
      // Clean up the URL object when component unmounts
      if (imagePreview && imagePreview !== product?.imagePath) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview, product?.imagePath]);

  return (
    <form
      action={action}
      className="space-y-8"
    >
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={product?.name || ""}
        />
        {error.name && <div className="text-destructive">{error.name}</div>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="priceInCents">Price In Cents</Label>
        <Input
          type="number"
          id="priceInCents"
          name="priceInCents"
          required
          value={priceInCents}
          onChange={(e) => setPriceInCents(e.target.value)}
          onWheel={(e) => (e.target as HTMLInputElement).blur()}
        />
        <div className="text-muted-foreground">
          {formatCurrency((Number(priceInCents) || 0) / 100)}
        </div>
        {error.priceInCents && (
          <div className="text-destructive">{error.priceInCents}</div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          defaultValue={product?.description}
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
              Current file: {product.imagePath.split("/").pop()}
            </p>
          </div>
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
            }
          }}
        />
        {imageHovered && product?.imagePath && (
          <p className="text-sm text-destructive transition-colors">
            Only upload a new image if you want to overwrite the current one.
          </p>
        )}
        {imagePreview && (
          <Image
            src={imagePreview}
            height="100"
            width="100"
            alt="Product Image"
          />
        )}
        {error.image && <div className="text-destructive">{error.image}</div>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="file">File</Label>
        {product?.filePath && (
          <div className="mb-2">
            <p className="text-sm text-muted-foreground">
              Current file: {product.filePath.split("/").pop()}
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
    <Button
      type="submit"
      disabled={pending}
      className="w-full"
    >
      {pending ? "Saving..." : "Save"}
    </Button>
  );
}
