import { NextRequest, NextResponse } from "next/server";
import { isS3Path } from "@/lib/s3.js";
import { getFileFromS3 } from "@/lib/s3.js";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json({ error: "Path is required" }, { status: 400 });
  }

  if (!isS3Path(path)) {
    // For local files, we can redirect to the original path
    return NextResponse.redirect(new URL(path, request.url));
  }

  // For S3 files, we need to fetch the file and stream it
  const file = await getFileFromS3(path);
  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // Extract content type based on file extension
  const extension = path.split(".").pop()?.toLowerCase() || "";
  const contentTypeMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
  };

  const contentType = contentTypeMap[extension] || "application/octet-stream";

  // Match the cache headers from netlify.toml for consistency
  return new NextResponse(file, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
    },
  });
}
