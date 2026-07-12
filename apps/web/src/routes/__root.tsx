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
        title: "prive-course",
      },
      {
        name: "description",
        content: "prive-course is a web application",
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
  primaryColor: "teal",
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
  headings: {
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    fontWeight: "720",
  },
  colors: {
    brass: [
      "#fbf6e7",
      "#f1e5bf",
      "#e5d091",
      "#d4b765",
      "#b08a3c",
      "#987331",
      "#775725",
      "#59401c",
      "#3b2a13",
      "#22180b",
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
