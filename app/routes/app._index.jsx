import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  BlockStack,
  Text,
  Button,
  InlineGrid,
  CalloutCard,
  Icon,
  Badge
} from "@shopify/polaris";
import { authenticate } from "../shopify.server.js";
import prisma from "../db.server.js";
import { ChartVerticalIcon, ViewIcon, DeliveryIcon } from "@shopify/polaris-icons";

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  const settings = await prisma.shopSettings.findUnique({
    where: { shop },
  });

  // Calculate past 7 days range
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const metrics = await prisma.dailyMetrics.findMany({
    where: {
      shop,
      date: {
        gte: sevenDaysAgo,
        lte: today
      }
    }
  });

  const totalViews = metrics.reduce((acc, curr) => acc + curr.views, 0);
  const totalAlerts = metrics.reduce((acc, curr) => acc + curr.alerts, 0);

  return json({
    shop,
    active: settings?.active ?? true,
    stats: {
      views: totalViews,
      alerts: totalAlerts,
    }
  });
}

export default function Dashboard() {
  const { active, stats } = useLoaderData();
  const navigate = useNavigate();

  return (
    <Page fullWidth>
      {/* Custom Hero Banner */}
      <div style={{
        background: "linear-gradient(135deg, #1A1B41 0%, #303273 100%)",
        borderRadius: "16px",
        padding: "40px",
        color: "white",
        marginBottom: "32px",
        boxShadow: "0 10px 30px rgba(48, 50, 115, 0.2)",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        
        <BlockStack gap="400">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Badge tone={active ? "success" : "critical"}>{active ? "App is Active" : "App is Disabled"}</Badge>
          </div>
          <Text as="h1" variant="heading3xl" fontWeight="bold">
            Supercharge Your Sales
          </Text>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.8)", maxWidth: "500px", margin: 0, lineHeight: "1.5" }}>
            Stock badges create urgency and trust. Stores using our customized badges see an average conversion lift of 12%.
          </p>
          <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
            <Button size="large" variant="primary" onClick={() => navigate("/app/design")}>Customize Badge</Button>
            <Button size="large" onClick={() => navigate("/app/pricing")}>Upgrade Plan</Button>
          </div>
        </BlockStack>
      </div>

      <Layout>
        <Layout.Section>
          <Text as="h2" variant="headingLg">Performance Overview (Last 7 Days)</Text>
          <div style={{ height: "16px" }} />
          <InlineGrid columns={2} gap="400">
            <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", border: "1px solid #EBEBEB" }}>
              <BlockStack gap="200">
                <div style={{ background: "#EBF1FF", width: "40px", height: "40px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#2962FF" }}>
                  <Icon source={ViewIcon} />
                </div>
                <Text as="p" variant="bodyMd" tone="subdued">Badge Views</Text>
                <Text as="h3" variant="heading2xl">{stats.views.toLocaleString()}</Text>
                <Text as="p" variant="bodySm" tone="success">Active Tracking Enabled</Text>
              </BlockStack>
            </div>

            <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", border: "1px solid #EBEBEB" }}>
              <BlockStack gap="200">
                <div style={{ background: "#FFF3E0", width: "40px", height: "40px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#E65100" }}>
                  <Icon source={DeliveryIcon} />
                </div>
                <Text as="p" variant="bodyMd" tone="subdued">Low Stock Alerts Triggered</Text>
                <Text as="h3" variant="heading2xl">{stats.alerts.toLocaleString()}</Text>
                <Text as="p" variant="bodySm" tone="success">Active Tracking Enabled</Text>
              </BlockStack>
            </div>
          </InlineGrid>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <div style={{ height: "44px" }} />
          <CalloutCard
            title="Need Help?"
            illustration="https://cdn.shopify.com/s/assets/admin/checkout/settings-customizecart-705f57c725ac05be5a34ec20c05b94298cb8afd10bf53cb21fd8a68d8ff4d642.svg"
            primaryAction={{
              content: 'View Setup Guide',
              onAction: () => navigate("/app/support"),
            }}
          >
            <p>Not sure how to add the badge to your product page? Check out our quick setup guide.</p>
          </CalloutCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
