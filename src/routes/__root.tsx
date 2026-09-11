import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { useState } from "react";
import { Toaster } from "sonner";
import { CartHost } from "@/components/cart-drawer";
import { CatalogSync } from "@/components/catalog";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { FALLBACK_CATALOG } from "@/lib/catalog/defaults";
import { getCatalog } from "@/lib/catalog/public";
import { AuthProvider } from "@/lib/auth/provider";
import appCss from "../styles.css?url";

const APP_NAME = "Zuvaan Dhanduveriya";

export const Route = createRootRoute({
  loader: async () => {
    try {
      return { catalog: await getCatalog() };
    } catch {
      return { catalog: FALLBACK_CATALOG };
    }
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "Island-grown produce from Meedhoo, Addu. Dragon fruit, greenhouse harvests and farm visits with Ramsey Hussain, Zuvaan Dhanduveriya.",
      },
      { name: "theme-color", content: "#070807" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600;700&display=swap",
      },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  const { catalog } = Route.useLoaderData();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { refetchOnWindowFocus: false } },
      }),
  );

  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <CatalogSync initial={catalog}>
              <Outlet />
              <CartHost />
              <Toaster
                theme="dark"
                position="bottom-center"
                toastOptions={{
                  className:
                    "!bg-elevated !text-fg !border-0 !shadow-[var(--shadow-border)]",
                }}
              />
            </CatalogSync>
          </QueryClientProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
