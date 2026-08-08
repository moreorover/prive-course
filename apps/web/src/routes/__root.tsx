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
      "#fff2f1",
      "#f9dddc",
      "#edb6b4",
      "#df8d8e",
      "#ca666d",
      "#aa4856",
      "#8d3947",
      "#702e3b",
      "#51222c",
      "#321319",
    ],
    gold: [
      "#fff2f1",
      "#f9dddc",
      "#edb6b4",
      "#df8d8e",
      "#ca666d",
      "#aa4856",
      "#8d3947",
      "#702e3b",
      "#51222c",
      "#321319",
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
