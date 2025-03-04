"use server";

import db from "@/db/db";
import { z } from "zod";
import fs from "fs/promises";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const fileSchema = z.instanceof(File, { message: "Required" });
const imageSchema = fileSchema.refine(
  (file) => file.size === 0 || file.type.startsWith("image/")
);

const addSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  priceInCents: z.coerce.number().int().min(1),
  file: fileSchema.refine((file) => file.size > 0, "Required"),
  image: imageSchema.refine((file) => file.size > 0, "Required"),
});

export async function addProduct(prevState: unknown, formData: FormData) {
  const result = addSchema.safeParse(Object.fromEntries(formData.entries()));
  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;

  await fs.mkdir("products", { recursive: true });
  const filePath = `products/${data.file.name.split(".")[0]}-${crypto.randomUUID()}.${data.file.name.split(".").pop()}`;
  await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()));

  await fs.mkdir("public/products", { recursive: true });
  const imagePath = `/products/${data.image.name.split(".")[0]}-${crypto.randomUUID()}.${data.image.name.split(".").pop()}`;
  await fs.writeFile(
    `public${imagePath}`,
    Buffer.from(await data.image.arrayBuffer())
  );

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
    await fs.unlink(product.filePath); //remove the existing file
    filePath = `products/${data.file.name.split(".")[0]}-${crypto.randomUUID()}.${data.file.name.split(".").pop()}`; // if a new file is uploaded, create a new file path
    await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()));
  }

  let imagePath = product.imagePath; // by default, keep the existing image path
  if (data.image != null && data.image.size > 0) {
    await fs.unlink(`public${product.imagePath}`); //remove the existing image
    imagePath = `/products/${data.image.name.split(".")[0]}-${crypto.randomUUID()}.${data.image.name.split(".").pop()}`; // if a new image is uploaded, create a new image path
    await fs.writeFile(
      `public${imagePath}`,
      Buffer.from(await data.image.arrayBuffer())
    );
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
  return product;
}

export async function deleteProduct(id: string) {
  const product = await db.product.delete({ where: { id } });
  if (product == null) {
    return notFound();
  }

  await fs.unlink(`${product.filePath}`);
  await fs.unlink(`public${product.imagePath}`);

  return product;
}
