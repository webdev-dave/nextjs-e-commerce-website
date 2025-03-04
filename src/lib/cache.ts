import { unstable_cache as nextCache } from "next/cache";
import { cache as reactCache } from "react";

type Callback<TArgs extends unknown[], TReturn> = (
  ...args: TArgs
) => Promise<TReturn>;

export function cache<TArgs extends unknown[], TReturn>(
  cb: Callback<TArgs, TReturn>,
  keyParts: string[],
  options: { revalidate?: number | false; tags?: string[] } = {}
) {
  return nextCache(reactCache(cb), keyParts, options);
}
