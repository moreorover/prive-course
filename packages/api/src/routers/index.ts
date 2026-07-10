import { protectedProcedure, publicProcedure, router } from "../index";
import { adminRouter } from "./admin";
import { courseRouter } from "./course";

export const appRouter = router({
  admin: adminRouter,
  courses: courseRouter,
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
});
export type AppRouter = typeof appRouter;
