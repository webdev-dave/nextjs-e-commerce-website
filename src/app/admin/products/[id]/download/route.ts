import db from "@/db/db";
import { notFound, redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { getFileFromS3, getSignedDownloadUrl, isS3Path } from "@/lib/s3.js";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Await the params Promise to get the actual id value
  const params = await context.params;
  const id = params.id;

  const product = await db.product.findUnique({
    where: { id },
    select: { filePath: true, name: true },
  });
  if (product == null) {
    return notFound();
  }

  // Handle S3 paths
  if (isS3Path(product.filePath)) {
    // Two options:
    // 1. Generate a signed URL and redirect (better for large files)
    const signedUrl = await getSignedDownloadUrl(product.filePath);
    if (signedUrl) {
      return redirect(signedUrl);
    }

    // 2. Get the file directly and serve it (keep as fallback)
    const file = await getFileFromS3(product.filePath);
    if (!file) {
      return notFound();
    }

    const extension = product.filePath.split(".").pop();
    return new NextResponse(file, {
      headers: {
        "Content-Disposition": `attachment; filename="${product.name}.${extension}"`,
        "Content-Length": file.length.toString(),
      },
    });
  }

  // Fallback to local file system for backwards compatibility (development mode)
  try {
    const fs = await import("node:fs/promises");
    const { size } = await fs.stat(product.filePath);
    const file = await fs.readFile(product.filePath);
    const extension = product.filePath.split(".").pop();

    return new NextResponse(file, {
      headers: {
        "Content-Disposition": `attachment; filename="${product.name}.${extension}"`,
        "Content-Length": size.toString(),
      },
    });
  } catch (error) {
    console.error("Error reading file:", error);
    return notFound();
  }
}
