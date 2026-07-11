#!/usr/bin/env node

const productionWebUrl = "https://prive-course-web-mselvenis.mselvenis.workers.dev";
const productionServerUrl = "https://prive-course-server-mselvenis.mselvenis.workers.dev";

function parseArgs(argv) {
  const args = {
    target: "local",
    webUrl: undefined,
    serverUrl: undefined,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--production") {
      args.target = "production";
      continue;
    }

    if (arg === "--local") {
      args.target = "local";
      continue;
    }

    if (arg === "--web-url") {
      args.webUrl = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--server-url") {
      args.serverUrl = argv[index + 1];
      index += 1;
    }
  }

  return args;
}

function trimTrailingSlash(value) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function getConfig() {
  const args = parseArgs(process.argv.slice(2));
  const isProduction = args.target === "production";
  const webUrl = trimTrailingSlash(
    args.webUrl ??
      process.env.SMOKE_WEB_URL ??
      (isProduction ? productionWebUrl : "http://localhost:3001"),
  );
  const serverUrl = trimTrailingSlash(
    args.serverUrl ??
      process.env.SMOKE_SERVER_URL ??
      (isProduction ? productionServerUrl : "http://localhost:3000"),
  );

  return {
    serverUrl,
    target: args.target,
    webUrl,
  };
}

async function readText(response) {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

async function check(name, task) {
  try {
    await task();
    console.log(`pass ${name}`);
  } catch (error) {
    console.error(`fail ${name}`);
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function findAssetPath(html) {
  const match = html.match(/(?:src|href)="([^"]*\/assets\/[^"]+)"/);

  return match?.[1] ?? null;
}

async function main() {
  const config = getConfig();

  console.log(`Smoke target: ${config.target}`);
  console.log(`Web: ${config.webUrl}`);
  console.log(`Server: ${config.serverUrl}`);

  let webHtml = "";

  await check("server health endpoint returns OK", async () => {
    const response = await fetch(`${config.serverUrl}/`);
    const body = await readText(response);

    assert(response.ok, `Expected 2xx from server health, got ${response.status}`);
    assert(body.trim() === "OK", `Expected health body "OK", got "${body.slice(0, 80)}"`);
  });

  await check("web shell loads", async () => {
    const response = await fetch(`${config.webUrl}/`);
    webHtml = await readText(response);

    assert(response.ok, `Expected 2xx from web root, got ${response.status}`);
    assert(
      response.headers.get("content-type")?.includes("text/html"),
      `Expected HTML content type, got ${response.headers.get("content-type")}`,
    );
    assert(webHtml.includes("<html"), "Expected web root to return an HTML document");
  });

  await check("web static asset loads", async () => {
    const assetPath = findAssetPath(webHtml);

    assert(assetPath, "Could not find a built asset in the web HTML");

    const assetUrl = assetPath.startsWith("http") ? assetPath : `${config.webUrl}${assetPath}`;
    const response = await fetch(assetUrl);

    assert(response.ok, `Expected 2xx from static asset, got ${response.status}`);
  });

  await check("client route falls back to SPA shell", async () => {
    const response = await fetch(`${config.webUrl}/courses`);
    const body = await readText(response);

    assert(response.ok, `Expected 2xx from SPA route, got ${response.status}`);
    assert(body.includes("<html"), "Expected SPA route to return the app shell");
  });

  await check("server CORS allows web origin with credentials", async () => {
    const response = await fetch(`${config.serverUrl}/trpc/courses.listGranted`, {
      headers: {
        "Access-Control-Request-Headers": "content-type",
        "Access-Control-Request-Method": "POST",
        Origin: config.webUrl,
      },
      method: "OPTIONS",
    });

    assert(response.ok, `Expected 2xx from CORS preflight, got ${response.status}`);
    assert(
      response.headers.get("access-control-allow-origin") === config.webUrl,
      `Expected CORS origin ${config.webUrl}, got ${response.headers.get(
        "access-control-allow-origin",
      )}`,
    );
    assert(
      response.headers.get("access-control-allow-credentials") === "true",
      "Expected CORS credentials header to be true",
    );
  });

  await check("protected course API rejects anonymous access", async () => {
    const input = encodeURIComponent(JSON.stringify({ 0: { json: null } }));
    const response = await fetch(
      `${config.serverUrl}/trpc/courses.listGranted?batch=1&input=${input}`,
      {
        headers: {
          Origin: config.webUrl,
        },
        method: "GET",
      },
    );
    const body = await readText(response);

    assert(
      response.status === 401 || body.includes("UNAUTHORIZED") || body.includes("No session"),
      `Expected anonymous request to be rejected, got ${response.status}: ${body.slice(0, 240)}`,
    );
  });

  if (process.exitCode) {
    process.exit(process.exitCode);
  }
}

await main();
