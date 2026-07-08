import { json } from "@remix-run/node";
import { Outlet, useLoaderData, Link } from "@remix-run/react";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { authenticate } from "../shopify.server.js";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export async function loader({ request }) {
  await authenticate.admin(request);
  return json({ apiKey: process.env.SHOPIFY_API_KEY || "" });
}

export async function action() {
  return json({ error: "Method not allowed" }, { status: 405 });
}

export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <ui-nav-menu>
        <Link to="/app" rel="home">Dashboard</Link>
        <Link to="/app/analytics">Analytics</Link>
        <Link to="/app/design">Design & Templates</Link>
        <Link to="/app/pricing">Pricing & Plans</Link>
        <Link to="/app/support">Support</Link>
      </ui-nav-menu>
      <Outlet />
    </AppProvider>
  );
}
