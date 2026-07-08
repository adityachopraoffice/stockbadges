import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { login } from "../shopify.server.js";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  const errors = await login(request);
  return json({ errors });
};

export const action = async ({ request }) => {
  const errors = await login(request);
  return json({ errors });
};

export default function Auth() {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const errors = actionData?.errors || loaderData?.errors;

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "50px", fontFamily: "sans-serif" }}>
      <div style={{ border: "1px solid #ccc", padding: "30px", borderRadius: "8px", maxWidth: "400px", width: "100%" }}>
        <h1 style={{ marginTop: 0, fontSize: "24px" }}>Install Stock Badge</h1>
        <p style={{ color: "#666", marginBottom: "20px" }}>Enter your Shopify store domain to install or log into the app.</p>
        
        {errors && <div style={{ color: "red", marginBottom: "15px" }}>{errors.shop}</div>}
        
        <Form method="post" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "5px", fontWeight: "bold" }}>
            Shop domain
            <input 
              type="text" 
              name="shop" 
              placeholder="your-store.myshopify.com" 
              style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
          </label>
          <button type="submit" style={{ padding: "10px", background: "#000", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
            Install / Login
          </button>
        </Form>
      </div>
    </div>
  );
}
