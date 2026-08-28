import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MovieNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <p className="text-6xl mb-4">🎬</p>
      <h1 className="text-2xl font-bold mb-2">Movie Not Found</h1>
      <p className="text-muted-foreground mb-6">
        This movie doesn&apos;t exist or was removed.
      </p>
      <Button asChild>
        <Link href="/movies">Browse Movies</Link>
      </Button>
    </div>
  );
}
