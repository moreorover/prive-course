import alchemy from "alchemy";
import { D1Database, Vite, Worker } from "alchemy/cloudflare";
import { CloudflareStateStore } from "alchemy/state";
import { config } from "dotenv";

type Stage = "dev" | "prod";

function getStage(): Stage {
  const stageArgIndex = process.argv.indexOf("--stage");
  const cliStage = stageArgIndex >= 0 ? process.argv[stageArgIndex + 1] : undefined;
  const stage = cliStage ?? process.env.ALCHEMY_STAGE ?? "dev";

  if (stage !== "dev" && stage !== "prod") {
    throw new Error(`Unsupported Alchemy stage "${stage}". Use "dev" or "prod".`);
  }

  return stage;
}

const stage = getStage();

config({ path: ".env" });
config({ path: `.env.${stage}`, override: true });

const app = await alchemy("prive-course", {
  stage,
  password: process.env.ALCHEMY_PASSWORD ?? process.env.PASSWORD,
  stateStore: process.env.ALCHEMY_STATE_TOKEN
    ? (scope) => new CloudflareStateStore(scope)
    : undefined,
});

const isProd = stage === "prod";
const suffix = stage;

const db = await D1Database("database", {
  name: `prive-course-${suffix}`,
  migrationsDir: "./packages/db/src/migrations",
});

export const server = await Worker("server", {
  name: `prive-course-server-${suffix}`,
  cwd: "./apps/server",
  entrypoint: "src/index.ts",
  compatibility: "node",
  url: true,
  observability: {
    enabled: true,
    logs: {
      enabled: true,
      invocationLogs: true,
      headSamplingRate: 1,
    },
    traces: {
      enabled: true,
      headSamplingRate: isProd ? 0.1 : 1,
    },
  },
  bindings: {
    DB: db,
    CORS_ORIGIN: alchemy.env.CORS_ORIGIN!,
    BETTER_AUTH_SECRET: alchemy.secret.env.BETTER_AUTH_SECRET!,
    BETTER_AUTH_URL: alchemy.env.BETTER_AUTH_URL!,
    CLOUDFLARE_ACCOUNT_ID: alchemy.env.CLOUDFLARE_ACCOUNT_ID!,
    CLOUDFLARE_STREAM_API_TOKEN: alchemy.secret.env.CLOUDFLARE_STREAM_API_TOKEN!,
  },
  dev: {
    port: 3000,
  },
});

export const web = await Vite("web", {
  name: `prive-course-web-${suffix}`,
  cwd: "./apps/web",
  entrypoint: "src/worker.ts",
  assets: "dist",
  spa: true,
  observability: {
    enabled: true,
    logs: {
      enabled: true,
      invocationLogs: true,
      headSamplingRate: 1,
    },
    traces: {
      enabled: true,
      headSamplingRate: isProd ? 0.1 : 1,
    },
  },
  bindings: {
    VITE_SERVER_URL: server.url!,
  },
});

console.log(`Stage  -> ${stage}`);
console.log(`Web    -> ${web.url}`);
console.log(`Server -> ${server.url}`);

await app.finalize();
