import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HeadContent, Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "sonner";

import Header from "@/components/header";
import type { trpc } from "@/utils/trpc";

import "../index.css";

export interface RouterAppContext {
  trpc: typeof trpc;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        title: "priauginimas.lt",
      },
      {
        name: "description",
        content: "Beauty video courses from priauginimas.lt",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
});

const theme = createTheme({
  defaultRadius: "sm",
  primaryColor: "rose",
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
  headings: {
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    fontWeight: "720",
  },
  colors: {
    rose: [
      "#fff1f4",
      "#f9dde4",
      "#efb5c5",
      "#e58ba3",
      "#d86688",
      "#c84c72",
      "#a7375c",
      "#842b49",
      "#5f2138",
      "#35131f",
    ],
    gold: [
      "#fff1f4",
      "#f9dde4",
      "#efb5c5",
      "#e58ba3",
      "#d86688",
      "#c84c72",
      "#a7375c",
      "#842b49",
      "#5f2138",
      "#35131f",
    ],
  },
  components: {
    Button: {
      defaultProps: {
        radius: "sm",
      },
    },
    Paper: {
      defaultProps: {
        radius: "sm",
      },
    },
  },
});

function RootComponent() {
  return (
    <>
      <HeadContent />
      <MantineProvider defaultColorScheme="auto" theme={theme}>
        <div className="grid grid-rows-[auto_1fr] h-svh">
          <Header />
          <Outlet />
        </div>
        <Toaster richColors />
      </MantineProvider>
      <TanStackRouterDevtools position="bottom-left" />
      <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
    </>
  );
}
