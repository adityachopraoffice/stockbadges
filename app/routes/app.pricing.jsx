import { json } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation, useActionData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Button,
  InlineGrid,
  Divider,
  List,
  Banner,
  Badge
} from "@shopify/polaris";
import { authenticate } from "../shopify.server.js";
import { boundary } from "@shopify/shopify-app-remix/server";
import prisma from "../db.server.js";

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};

export async function loader({ request }) {
  const { billing, session } = await authenticate.admin(request);
  const isTest = process.env.APP_PUBLISHED !== "true";
  
  let activePlan = "Free";
  try {
    const billingCheck = await billing.check({
      plans: ["Starter", "Pro"],
      isTest,
    });
    
    if (billingCheck.hasActivePayment) {
      activePlan = billingCheck.appSubscriptions[0].name;
    } else {
      throw new Error("No active payment found via check");
    }
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error("Billing check failed or returned no active payment:", error);
    
    try {
      const shopSettings = await prisma.shopSettings.findUnique({
        where: { shop: session.shop },
      });
      activePlan = shopSettings?.plan || "Free";
    } catch (dbError) {
      console.error("Fallback DB check failed:", dbError);
      activePlan = "Free";
    }
  }

  return json({ activePlan });
}

export async function action({ request }) {
  const { billing, session } = await authenticate.admin(request);
  const { shop } = session;
  const formData = await request.formData();
  const plan = formData.get("plan");
  
  const isTest = process.env.APP_PUBLISHED !== "true";

  if (plan === "Starter" || plan === "Pro") {
    try {
      const cleanShopName = shop.replace('.myshopify.com', '');
      const timestamp = Date.now();
      const adminUrl = `https://admin.shopify.com/store/${cleanShopName}/apps/${process.env.SHOPIFY_API_KEY}/app/pricing?updated=${timestamp}`;
      
      await billing.require({
        plans: [plan],
        isTest,
        onFailure: async () => billing.request({ plan, isTest, returnUrl: adminUrl }),
      });
    } catch (error) {
      if (error instanceof Response || (error && typeof error.status === 'number')) throw error; // LET THE REDIRECT HAPPEN!
      console.error("CRITICAL BILLING ERROR:", error);
      return json({ error: `Billing Error: ${error.message || JSON.stringify(error)}` }, { status: 400 });
    }
  } else if (plan === "Free") {
    try {
      const billingCheck = await billing.check({
        plans: ["Starter", "Pro"],
        isTest,
      });
      
      if (billingCheck.hasActivePayment) {
        await billing.cancel({
          subscriptionId: billingCheck.appSubscriptions[0].id,
          isTest,
          prorate: true,
        });
      }
    } catch (error) {
      if (error instanceof Response) throw error;
      console.error("Billing cancel failed:", error);
    }
  }
  
  return json({ success: true, activePlan: plan });
}

export default function Pricing() {
  const { activePlan } = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isLoading = navigation.state === "submitting";

  const handlePlanSelect = (plan) => {
    submit({ plan }, { method: "post" });
  };

  const PlanCard = ({ title, price, features, current, recommended, onSelect }) => (
    <div style={{
      background: recommended ? "linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)" : "#fff",
      padding: "24px",
      borderRadius: "16px",
      boxShadow: recommended ? "0 8px 24px rgba(255, 143, 0, 0.15)" : "0 4px 12px rgba(0,0,0,0.05)",
      border: recommended ? "2px solid #FF9800" : "1px solid #EBEBEB",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      height: "100%"
    }}>
      {recommended && (
        <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)" }}>
          <Badge tone="warning">Most Popular</Badge>
        </div>
      )}
      
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <Text variant="headingLg" as="h2">{title}</Text>
        <div style={{ margin: "16px 0" }}>
          <Text variant="heading3xl" as="h1" fontWeight="bold">{price}</Text>
        </div>
      </div>
      
      <Divider />
      
      <div style={{ flexGrow: 1, padding: "24px 0", textAlign: "left" }}>
        <ul style={{ paddingLeft: "20px", margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
          {features.map((f, i) => <li key={i}><Text variant="bodyMd">{f}</Text></li>)}
        </ul>
      </div>
      
      <div style={{ marginTop: "auto" }}>
        <Button 
          size="large"
          variant={current ? "plain" : (recommended ? "primary" : "secondary")}
          disabled={current} 
          onClick={onSelect}
          loading={isLoading}
          fullWidth
        >
          {current ? "Current Plan" : "Select Plan"}
        </Button>
      </div>
    </div>
  );

  return (
    <Page fullWidth>
      <div style={{
        background: "linear-gradient(135deg, #FFB75E 0%, #ED8F03 100%)",
        borderRadius: "16px",
        padding: "40px",
        color: "white",
        marginBottom: "48px",
        textAlign: "center",
        boxShadow: "0 10px 30px rgba(237, 143, 3, 0.2)",
      }}>
        <BlockStack gap="200" inlineAlign="center">
          <Text as="h1" variant="heading2xl" fontWeight="bold">Grow With Us</Text>
          <p style={{ fontSize: "16px", margin: 0, opacity: 0.9, maxWidth: "600px" }}>
            Whether you're just starting out or scaling up, we have a plan designed to help you sell more effectively.
          </p>
        </BlockStack>
      </div>

      <Layout>
        <Layout.Section>
          {actionData?.error && (
            <div style={{ marginBottom: "24px" }}>
              <Banner tone="critical" title="Billing Error">
                <p>{actionData.error}</p>
              </Banner>
            </div>
          )}
          <InlineGrid columns={{xs: 1, sm: 1, md: 3}} gap="400">
            <PlanCard 
              title="Free"
              price="$0/mo"
              features={[
                "Basic Template",
                "No Customization",
                "Max Threshold: 10"
              ]}
              current={activePlan === "Free"}
              onSelect={() => handlePlanSelect("Free")}
            />
            <PlanCard 
              title="Starter"
              price="$9.99/mo"
              features={[
                "All 4 Premium Templates",
                "No Customization",
                "Max Threshold: 50"
              ]}
              current={activePlan === "Starter"}
              onSelect={() => handlePlanSelect("Starter")}
            />
            <PlanCard 
              title="Pro"
              price="$19.99/mo"
              features={[
                "All 4 Premium Templates",
                "Full Color & Style Customization",
                "Unlimited Threshold",
                "Priority Support"
              ]}
              current={activePlan === "Pro"}
              recommended={true}
              onSelect={() => handlePlanSelect("Pro")}
            />
          </InlineGrid>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
