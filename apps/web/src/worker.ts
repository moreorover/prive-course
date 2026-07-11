type Env = {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
};

const assetExtensionPattern = /\.[a-zA-Z0-9]+$/;

function isAssetRequest(pathname: string) {
  return pathname.startsWith("/assets/") || assetExtensionPattern.test(pathname);
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    const response = await env.ASSETS.fetch(request);

    if (response.status !== 404 || request.method !== "GET" || isAssetRequest(url.pathname)) {
      return response;
    }

    return env.ASSETS.fetch(new Request(new URL("/index.html", url), request));
  },
};
