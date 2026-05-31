"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Suppress React 19 dev warning about next-themes script tags on client
  React.useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const originalError = console.error;
      console.error = (...args) => {
        if (typeof args[0] === "string" && args[0].includes("Encountered a script tag while rendering React component")) {
          return;
        }
        originalError(...args);
      };
      return () => {
        console.error = originalError;
      };
    }
  }, []);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
