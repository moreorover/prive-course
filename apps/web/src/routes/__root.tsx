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
  primaryColor: "teal",
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
  headings: {
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
  },
});

function RootComponent() {
  return (
    <>
      <HeadContent />
      <MantineProvider defaultColorScheme="dark" theme={theme}>
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
