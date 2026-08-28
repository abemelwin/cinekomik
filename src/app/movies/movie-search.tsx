"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface MovieSearchProps {
  initialQuery: string;
}

export function MovieSearch({ initialQuery }: MovieSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(initialQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushSearch = useCallback(
    (q: string) => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      router.push(`${pathname}${params.toString() ? `?${params}` : ""}`);
    },
    [router, pathname]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value === initialQuery) return;
    debounceRef.current = setTimeout(() => {
      pushSearch(value.trim());
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleClear = () => {
    setValue("");
    router.push(pathname);
  };

  return (
    <div className="relative max-w-lg">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        placeholder="Search movies..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-9 pr-9"
        aria-label="Search movies"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
