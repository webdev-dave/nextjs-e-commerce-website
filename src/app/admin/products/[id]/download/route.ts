import db from "@/db/db";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Await the params Promise to get the actual id value
  const params = await context.params;
  const { id } = params;

  const product = await db.product.findUnique({
    where: { id },
    select: { filePath: true, name: true },
  });
  if (product == null) {
    return notFound();
  }

  const { size } = await fs.stat(product.filePath);
  const file = await fs.readFile(product.filePath);
  const extension = product.filePath.split(".").pop();

  return new NextResponse(file, {
    headers: {
      "Content-Disposition": `attachment; filename="${product.name}.${extension}"`,
      "Content-Length": size.toString(),
    },
  });
}
