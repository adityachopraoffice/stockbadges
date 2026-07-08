import { login } from "../shopify.server.js";

export const loader = async ({ request }) => {
  try {
    await login(request);
    return new Response("OK");
  } catch (error) {
    if (error instanceof Response) throw error;
    const html = `<html><body><h1>Error</h1><pre>${error.message}</pre><pre>${error.stack}</pre></body></html>`;
    return new Response(html, { status: 500, headers: { "Content-Type": "text/html" } });
  }
};
