import { isS3Path } from "./s3.js";

/**
 * Converts various image path formats to URLs that can be used with Next.js Image component
 */
export async function getImageUrl(imagePath: string): Promise<string> {
  // Local paths starting with / are in the public folder
  if (imagePath.startsWith("/") && !imagePath.startsWith("//")) {
    return imagePath;
  }

  // Handle S3 paths
  if (isS3Path(imagePath)) {
    // Use our proxy endpoint to get the image
    return `/api/images/proxy?path=${encodeURIComponent(imagePath)}`;
  }

  // Return the original path as a fallback
  return imagePath;
}
