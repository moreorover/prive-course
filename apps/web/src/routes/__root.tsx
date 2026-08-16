import { AppShell, MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import { useDisclosure } from "@mantine/hooks";
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
  defaultRadius: "md",
  primaryColor: "rose",
  fontFamily: 'Avenir, "Avenir Next", "Segoe UI", Helvetica, Arial, sans-serif',
  headings: {
    fontFamily: 'Avenir, "Avenir Next", "Segoe UI", Helvetica, Arial, sans-serif',
    fontWeight: "760",
  },
  colors: {
    rose: [
      "#fff0f7",
      "#f9d8e7",
      "#efaecc",
      "#e583b0",
      "#dc5f99",
      "#d54589",
      "#b01257",
      "#951048",
      "#7b0f3d",
      "#4a071f",
    ],
  },
  components: {
    Button: {
      defaultProps: {
        radius: "xl",
      },
    },
    Paper: {
      defaultProps: {
        radius: "md",
      },
    },
  },
});

function RootComponent() {
  const [mobileNavOpened, { close: closeMobileNav, toggle: toggleMobileNav }] =
    useDisclosure(false);

  return (
    <>
      <HeadContent />
      <MantineProvider defaultColorScheme="auto" theme={theme}>
        <AppShell
          className="pc-app-shell"
          header={{ height: { base: 62, sm: 68 } }}
          navbar={{
            width: 280,
            breakpoint: "sm",
            collapsed: { mobile: !mobileNavOpened, desktop: true },
          }}
          padding={0}
          withBorder={false}
        >
          <Header
            mobileNavOpened={mobileNavOpened}
            onMobileNavClose={closeMobileNav}
            onMobileNavToggle={toggleMobileNav}
          />
          <AppShell.Main>
            <Outlet />
          </AppShell.Main>
        </AppShell>
        <Toaster richColors />
      </MantineProvider>
      <TanStackRouterDevtools position="bottom-left" />
      <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
    </>
  );
}
