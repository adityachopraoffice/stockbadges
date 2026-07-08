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
  Banner
} from "@shopify/polaris";
import { authenticate } from "../shopify.server.js";

export async function loader({ request }) {
  const { billing, admin } = await authenticate.admin(request);
  
  const shopQuery = await admin.graphql(`query { shop { plan { partnerDevelopment } } }`);
  const shopData = await shopQuery.json();
  const isDevStore = shopData.data?.shop?.plan?.partnerDevelopment === true;
  
  let activePlan = "Free";
  try {
    const billingCheck = await billing.check({
      plans: ["Starter", "Pro"],
      isTest: isDevStore,
    });
    activePlan = billingCheck.hasActivePayment 
      ? billingCheck.appSubscriptions[0].name 
      : "Free";
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error("Billing check failed:", error);
    activePlan = "Free";
  }

  return json({ activePlan });
}

export async function action({ request }) {
  const { billing, admin, session } = await authenticate.admin(request);
  const { shop } = session;
  const formData = await request.formData();
  const plan = formData.get("plan");

  const shopQuery = await admin.graphql(`query { shop { plan { partnerDevelopment } } }`);
  const shopData = await shopQuery.json();
  const isDevStore = shopData.data?.shop?.plan?.partnerDevelopment === true;

  if (plan === "Starter" || plan === "Pro") {
    try {
      const cleanShopName = shop.replace('.myshopify.com', '');
      const adminUrl = `https://admin.shopify.com/store/${cleanShopName}/apps/${process.env.SHOPIFY_API_KEY}/app/pricing`;
      
      await billing.require({
        plans: [plan],
        isTest: isDevStore,
        onFailure: async () => billing.request({ plan, isTest: isDevStore, returnUrl: adminUrl }),
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
        isTest: isDevStore,
      });
      
      if (billingCheck.hasActivePayment) {
        await billing.cancel({
          subscriptionId: billingCheck.appSubscriptions[0].id,
          isTest: isDevStore,
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

  const PlanCard = ({ title, price, features, current, onSelect }) => (
    <Card>
      <BlockStack gap="400">
        <Text variant="headingLg" as="h2">{title}</Text>
        <Text variant="headingXl" as="h1">{price}</Text>
        <Divider />
        <List>
          {features.map((f, i) => <List.Item key={i}>{f}</List.Item>)}
        </List>
        <Button 
          variant={current ? "plain" : "primary"}
          disabled={current} 
          onClick={onSelect}
          loading={isLoading}
        >
          {current ? "Current Plan" : "Select Plan"}
        </Button>
      </BlockStack>
    </Card>
  );

  return (
    <Page title="Pricing & Plans">
      <Layout>
        <Layout.Section>
          {actionData?.error && (
            <div style={{ marginBottom: "1rem" }}>
              <Banner tone="critical" title="Billing Error">
                <p>{actionData.error}</p>
              </Banner>
            </div>
          )}
          <InlineGrid columns={3} gap="400">
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
              price="$4.99/mo"
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
              price="$9.99/mo"
              features={[
                "All 4 Premium Templates",
                "Full Color & Style Customization",
                "Unlimited Threshold"
              ]}
              current={activePlan === "Pro"}
              onSelect={() => handlePlanSelect("Pro")}
            />
          </InlineGrid>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
