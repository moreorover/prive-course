import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { trpc } from "@/utils/trpc";

const privateDataQueryOptions = trpc.privateData.queryOptions();

export const Route = createFileRoute("/_auth/dashboard")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(privateDataQueryOptions);
  },
});

function RouteComponent() {
  const { session } = Route.useRouteContext();

  const privateData = useQuery(privateDataQueryOptions);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome {session.data?.user.name}</p>
      <p>API: {privateData.data?.message}</p>
    </div>
  );
}
