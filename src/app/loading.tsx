import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Loader2 className="size-24 animate-spin"></Loader2>
    </div>
  );
}
