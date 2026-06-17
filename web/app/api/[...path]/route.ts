import { backendApiUrl } from "@/app/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProxyContext = {
  params: Promise<{ path: string[] }>;
};

async function proxy(request: Request, context: ProxyContext) {
  const { path } = await context.params;
  const sourceUrl = new URL(request.url);
  const targetUrl = backendApiUrl(`/api/${path.join("/")}${sourceUrl.search}`);
  const headers = new Headers(request.headers);

  headers.delete("host");
  headers.delete("content-length");

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
    redirect: "manual",
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

export function GET(request: Request, context: ProxyContext) {
  return proxy(request, context);
}

export function POST(request: Request, context: ProxyContext) {
  return proxy(request, context);
}

export function PATCH(request: Request, context: ProxyContext) {
  return proxy(request, context);
}

export function PUT(request: Request, context: ProxyContext) {
  return proxy(request, context);
}

export function DELETE(request: Request, context: ProxyContext) {
  return proxy(request, context);
}
