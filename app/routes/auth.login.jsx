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
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'San Francisco', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif" 
    }}>
      <div style={{ 
        background: "#ffffff", 
        padding: "40px", 
        borderRadius: "16px", 
        maxWidth: "420px", 
        width: "100%",
        boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
        textAlign: "center"
      }}>
        <div style={{
          width: "64px",
          height: "64px",
          background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)",
          borderRadius: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "32px",
          margin: "0 auto 24px auto",
          boxShadow: "0 8px 16px rgba(255, 107, 107, 0.3)"
        }}>
          🔥
        </div>
        
        <h1 style={{ margin: "0 0 16px 0", fontSize: "28px", fontWeight: "bold", color: "#1A1A1A" }}>Stock Badges</h1>
        <p style={{ color: "#666", fontSize: "16px", margin: "0 0 32px 0", lineHeight: "1.5" }}>
          Supercharge your sales with beautiful urgency badges. Log in to get started.
        </p>
        
        {errors?.shop && (
          <div style={{ background: "#FEE2E2", color: "#B91C1C", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" }}>
            {errors.shop}
          </div>
        )}
        
        <Form method="post" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "8px", fontWeight: "600", color: "#333", textAlign: "left" }}>
            Shop Domain
            <input 
              type="text" 
              name="shop" 
              placeholder="your-store.myshopify.com" 
              style={{ 
                padding: "12px 16px", 
                border: "2px solid #E5E7EB", 
                borderRadius: "8px",
                fontSize: "16px",
                outline: "none",
                transition: "border-color 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = '#FF6B6B'}
              onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
            />
          </label>
          <button 
            type="submit" 
            style={{ 
              padding: "14px", 
              background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)", 
              color: "#fff", 
              border: "none", 
              borderRadius: "8px", 
              cursor: "pointer", 
              fontWeight: "bold",
              fontSize: "16px",
              boxShadow: "0 4px 12px rgba(255, 107, 107, 0.3)",
              transition: "transform 0.1s"
            }}
            onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            Log In / Install
          </button>
        </Form>
      </div>
    </div>
  );
}
