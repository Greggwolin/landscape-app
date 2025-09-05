// src/app/components/ThemeRegistry.tsx
// v1.2 — fixes hydration by injecting Emotion styles during SSR

"use client";

import * as React from "react";
import { useServerInsertedHTML } from "next/navigation";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";

// Create a new Emotion cache with 'mui' key and prepend true
function createEmotionCache() {
  return createCache({ key: "mui", prepend: true });
}

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const cache = React.useMemo(() => createEmotionCache(), []);
  const inserted: string[] = [];

  // Monkey‑patch cache.insert to keep track of injected names
  const prevInsert = cache.insert;
  cache.insert = (...args: any[]) => {
    const [selector, serialized] = args;
    if (!cache.inserted[serialized.name]) {
      inserted.push(serialized.name);
    }
    // @ts-ignore
    return prevInsert.apply(cache, args);
  };

  // Push collected styles into the server HTML so client matches server
  useServerInsertedHTML(() => {
    const styles = inserted
      .map((name) => cache.inserted[name])
      .filter(Boolean)
      .join("");
    return (
      <style
        data-emotion={`${cache.key} ${inserted.join(" ")}`}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}


