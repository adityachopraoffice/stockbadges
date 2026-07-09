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
      {/* Custom Hero Banner - WARM SUNRISE */}
      <div style={{
        background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)",
        borderRadius: "16px",
        padding: "40px",
        color: "white",
        marginBottom: "32px",
        boxShadow: "0 10px 30px rgba(255, 107, 107, 0.3)",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />
        <div style={{ position: "absolute", bottom: "-80px", left: "20%", width: "150px", height: "150px", borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
        
        <BlockStack gap="400">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Badge tone={active ? "success" : "critical"}>{active ? "App is Active" : "App is Disabled"}</Badge>
          </div>
          <Text as="h1" variant="heading3xl" fontWeight="bold">
            Supercharge Your Sales
          </Text>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.9)", maxWidth: "500px", margin: 0, lineHeight: "1.5" }}>
            Scarcity Badge Pro creates urgency and trust. Stores using our customized badges see an average conversion lift of 12%.
          </p>
          <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
            <Button size="large" onClick={() => navigate("/app/design")}>Customize Badge</Button>
            <Button size="large" variant="plain" onClick={() => navigate("/app/pricing")}>
              <span style={{color: "white"}}>Upgrade Plan →</span>
            </Button>
          </div>
        </BlockStack>
      </div>

      <Layout>
        <Layout.Section>
          <Text as="h2" variant="headingLg">Performance Overview (Last 7 Days)</Text>
          <div style={{ height: "16px" }} />
          <InlineGrid columns={2} gap="400">
            <div style={{ background: "#fff", padding: "24px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #FFF0F0" }}>
              <BlockStack gap="200">
                <div style={{ background: "#FFE8E8", width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF4D4D" }}>
                  <Icon source={ViewIcon} />
                </div>
                <Text as="p" variant="bodyMd" tone="subdued">Badge Views</Text>
                <Text as="h3" variant="heading2xl">{stats.views.toLocaleString()}</Text>
                <Text as="p" variant="bodySm" tone="success">Active Tracking Enabled</Text>
              </BlockStack>
            </div>

            <div style={{ background: "#fff", padding: "24px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #FFF0F0" }}>
              <BlockStack gap="200">
                <div style={{ background: "#FFF3E0", width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF8F00" }}>
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
          <div style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
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
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
