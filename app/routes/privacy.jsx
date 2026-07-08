import { json } from "@remix-run/node";

export const meta = () => {
  return [{ title: "Privacy Policy | Stock Badges" }];
};

export default function PrivacyPolicy() {
  return (
    <div style={{ 
      fontFamily: "-apple-system, BlinkMacSystemFont, 'San Francisco', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
      color: "#333",
      lineHeight: "1.6",
      padding: "0"
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)",
        padding: "60px 20px",
        textAlign: "center",
        color: "white"
      }}>
        <h1 style={{ margin: 0, fontSize: "36px", fontWeight: "bold" }}>Privacy Policy</h1>
        <p style={{ margin: "10px 0 0 0", fontSize: "18px", opacity: 0.9 }}>Last updated: July 2026</p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
        
        <h2 style={{ fontSize: "24px", marginTop: "32px", color: "#1A1A1A" }}>1. Information We Collect</h2>
        <p>
          When you install the Stock Badges app, we are automatically able to access certain types of information from your Shopify account:
        </p>
        <ul style={{ paddingLeft: "20px" }}>
          <li><strong>Shop Information:</strong> Your shop domain, email address, and active plan details.</li>
          <li><strong>Product Information:</strong> We access product inventory levels to determine when to display urgency badges.</li>
          <li><strong>Analytics Data:</strong> We track anonymous metrics such as how many times a badge is viewed on your storefront to provide you with performance analytics.</li>
        </ul>

        <h2 style={{ fontSize: "24px", marginTop: "32px", color: "#1A1A1A" }}>2. How We Use Your Information</h2>
        <p>
          We use the information we collect solely for the purpose of providing and improving the Stock Badges app functionality. Specifically:
        </p>
        <ul style={{ paddingLeft: "20px" }}>
          <li>To display accurate low-stock badges to your customers.</li>
          <li>To bill you appropriately according to your selected plan.</li>
          <li>To provide you with analytics on your app dashboard.</li>
          <li>To communicate with you regarding support requests or app updates.</li>
        </ul>

        <h2 style={{ fontSize: "24px", marginTop: "32px", color: "#1A1A1A" }}>3. Data Sharing</h2>
        <p>
          We <strong>do not</strong> sell, rent, or trade your personal information or your customers' information to any third parties. We only share information with service providers (like our database hosting) to the extent necessary to run the app securely.
        </p>

        <h2 style={{ fontSize: "24px", marginTop: "32px", color: "#1A1A1A" }}>4. Data Retention</h2>
        <p>
          We retain your shop's configuration and analytics data for as long as you have the app installed. If you uninstall the app, you may request the deletion of your data by contacting our support team. We automatically purge stale analytics data periodically in accordance with Shopify's data minimization policies.
        </p>

        <h2 style={{ fontSize: "24px", marginTop: "32px", color: "#1A1A1A" }}>5. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy or how your data is handled, please contact us through the Support tab within the Stock Badges app dashboard, or email our support team directly.
        </p>

      </div>
    </div>
  );
}
