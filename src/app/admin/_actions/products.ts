"use server";

import db from "@/db/db";
import { z } from "zod";
import fs from "fs/promises";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { deleteFileFromS3, isS3Path, uploadFileToS3 } from "@/lib/s3.js";

// Create a more flexible file schema that works in both browser and Node.js
const fileSchema =
  typeof File !== "undefined"
    ? z.instanceof(File, { message: "Required" })
    : z.any().refine((val) => val && typeof val === "object" && "size" in val, {
        message: "Required",
      });

const imageSchema = fileSchema.refine(
  (file) => file.size === 0 || (file.type && file.type.startsWith("image/")),
  { message: "Must be an image file" }
);

const addSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  priceInCents: z.coerce.number().int().min(50, "Price must be at least $0.50"),
  file: fileSchema.refine((file) => file.size > 0, "Required"),
  image: imageSchema.refine((file) => file.size > 0, "Required"),
});

export async function addProduct(prevState: unknown, formData: FormData) {
  const result = addSchema.safeParse(Object.fromEntries(formData.entries()));
  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;
  let filePath, imagePath;

  // If we have AWS credentials, upload to S3
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    // Upload file to S3
    const fileKey = `products/${data.file.name.split(".")[0]}-${crypto.randomUUID()}.${data.file.name.split(".").pop()}`;
    filePath = await uploadFileToS3(data.file, fileKey);

    // Upload image to S3
    const imageKey = `products/${data.image.name.split(".")[0]}-${crypto.randomUUID()}.${data.image.name.split(".").pop()}`;
    imagePath = await uploadFileToS3(data.image, imageKey);
  } else {
    // Fallback to local filesystem for development
    await fs.mkdir("products", { recursive: true });
    filePath = `products/${data.file.name.split(".")[0]}-${crypto.randomUUID()}.${data.file.name.split(".").pop()}`;
    await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()));

    await fs.mkdir("public/products", { recursive: true });
    imagePath = `/products/${data.image.name.split(".")[0]}-${crypto.randomUUID()}.${data.image.name.split(".").pop()}`;
    await fs.writeFile(
      `public${imagePath}`,
      Buffer.from(await data.image.arrayBuffer())
    );
  }

  await db.product.create({
    data: {
      isAvailableForPurchase: false,
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      filePath,
      imagePath,
    },
  });

  revalidatePath("/");
  revalidatePath("/products");

  redirect("/admin/products");
}

const editSchema = addSchema.extend({
  file: fileSchema.optional(),
  image: imageSchema.optional(),
});

export async function updateProduct(
  id: string,
  prevState: unknown,
  formData: FormData
) {
  const result = editSchema.safeParse(Object.fromEntries(formData.entries()));
  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;
  const product = await db.product.findUnique({ where: { id } });
  if (product == null) {
    return notFound();
  }

  let filePath = product.filePath; // by default, keep the existing file path
  if (data.file != null && data.file.size > 0) {
    // Delete old file
    if (isS3Path(product.filePath)) {
      await deleteFileFromS3(product.filePath);
    } else {
      try {
        await fs.unlink(product.filePath);
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    }

    // Upload new file
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      const fileKey = `products/${data.file.name.split(".")[0]}-${crypto.randomUUID()}.${data.file.name.split(".").pop()}`;
      filePath = await uploadFileToS3(data.file, fileKey);
    } else {
      // Fallback to local filesystem for development
      filePath = `products/${data.file.name.split(".")[0]}-${crypto.randomUUID()}.${data.file.name.split(".").pop()}`;
      await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()));
    }
  }

  let imagePath = product.imagePath; // by default, keep the existing image path
  if (data.image != null && data.image.size > 0) {
    // Delete old image
    if (isS3Path(product.imagePath)) {
      await deleteFileFromS3(product.imagePath);
    } else {
      try {
        await fs.unlink(`public${product.imagePath}`);
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }

    // Upload new image
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      const imageKey = `products/${data.image.name.split(".")[0]}-${crypto.randomUUID()}.${data.image.name.split(".").pop()}`;
      imagePath = await uploadFileToS3(data.image, imageKey);
    } else {
      // Fallback to local filesystem for development
      imagePath = `/products/${data.image.name.split(".")[0]}-${crypto.randomUUID()}.${data.image.name.split(".").pop()}`;
      await fs.writeFile(
        `public${imagePath}`,
        Buffer.from(await data.image.arrayBuffer())
      );
    }
  }

  await db.product.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      filePath,
      imagePath,
    },
  });

  revalidatePath("/");
  revalidatePath("/products");

  redirect("/admin/products");
}

export async function toggleProductAvailability(
  id: string,
  isAvailableForPurchase: boolean
) {
  const product = await db.product.update({
    where: { id },
    data: { isAvailableForPurchase },
  });
  revalidatePath("/");
  revalidatePath("/products");
  return product;
}

export async function deleteProduct(id: string) {
  const product = await db.product.delete({ where: { id } });
  if (product == null) {
    return notFound();
  }

  // Handle file deletion based on storage type
  if (isS3Path(product.filePath)) {
    await deleteFileFromS3(product.filePath);
  } else {
    try {
      await fs.unlink(`${product.filePath}`);
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  }

  // Handle image deletion based on storage type
  if (isS3Path(product.imagePath)) {
    await deleteFileFromS3(product.imagePath);
  } else {
    try {
      await fs.unlink(`public${product.imagePath}`);
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  }

  revalidatePath("/");
  revalidatePath("/products");
  return product;
}
