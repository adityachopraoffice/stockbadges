import { useEffect, useState } from "react";
import { json } from "@remix-run/node";
import { useActionData, useLoaderData, useSubmit, useNavigation, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  TextField,
  InlineStack,
  Text,
  Select,
  Grid,
  Banner
} from "@shopify/polaris";
import { authenticate } from "../shopify.server.js";
import { boundary } from "@shopify/shopify-app-remix/server";
import prisma from "../db.server.js";

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};

const TEMPLATES = {
  custom: { name: "Basic", badgeBgColor: "#FF4444", badgeTextColor: "#FFFFFF" },
  minimal: { name: "Minimal", badgeBgColor: "#F4F6F8", badgeTextColor: "#202223", badgePadding: "4px 10px", badgeBorderRadius: "20px" },
  urgency: { name: "Urgency Red", badgeBgColor: "#D82C0D", badgeTextColor: "#FFFFFF", badgePadding: "6px 12px", badgeBorderRadius: "4px" },
  bold: { name: "Bold Dark", badgeBgColor: "#000000", badgeTextColor: "#FFFFFF", badgePadding: "8px 16px", badgeBorderRadius: "0px" },
};

export async function loader({ request }) {
  const { session, billing, admin } = await authenticate.admin(request);
  const { shop } = session;

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
    activePlan = "Free";
  }

  const settings = await prisma.shopSettings.findUnique({
    where: { shop },
  });

  return json({
    activePlan,
    settings: settings || {
      active: true,
      templateStyle: "custom",
      threshold: 10,
      badgeText: "Only {count} left!",
      badgeBgColor: "#FF4444",
      badgeTextColor: "#FFFFFF",
      badgeFontSize: "14px",
      badgePadding: "4px 10px",
      badgeBorderRadius: "4px"
    }
  });
}

export async function action({ request }) {
  const { session, billing, admin } = await authenticate.admin(request);
  const { shop } = session;
  
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
    activePlan = "Free";
  }

  const currentSettings = await prisma.shopSettings.findUnique({
    where: { shop },
  });

  const formData = await request.formData();
  
  let threshold = parseInt(formData.get("threshold") || "10", 10);
  let templateStyle = formData.get("templateStyle") || "custom";
  
  let badgeBgColor = formData.get("badgeBgColor") || "#FF4444";
  let badgeTextColor = formData.get("badgeTextColor") || "#FFFFFF";
  let badgeFontSize = formData.get("badgeFontSize") || "14px";
  let badgePadding = formData.get("badgePadding") || "4px 10px";
  let badgeBorderRadius = formData.get("badgeBorderRadius") || "4px";

  // Enforce Max Threshold
  if (activePlan === "Free" && threshold > 10) threshold = 10;
  if (activePlan === "Starter" && threshold > 50) threshold = 50;

  // Enforce Templates
  if (activePlan === "Free") {
    templateStyle = "custom";
  }

  // Enforce Customization
  if (activePlan !== "Pro") {
    const t = TEMPLATES[templateStyle];
    badgeBgColor = t.badgeBgColor;
    badgeTextColor = t.badgeTextColor;
    badgePadding = t.badgePadding || "4px 10px";
    badgeBorderRadius = t.badgeBorderRadius || "4px";
  }

  const settings = {
    active: formData.get("active") === "true",
    templateStyle,
    threshold,
    badgeText: formData.get("badgeText") || "Only {count} left!",
    badgeBgColor,
    badgeTextColor,
    badgeFontSize,
    badgePadding,
    badgeBorderRadius,
  };

  await prisma.shopSettings.upsert({
    where: { shop },
    update: settings,
    create: { shop, ...settings },
  });

  return json({ success: true, settings });
}

export default function Design() {
  const { settings: initialSettings, activePlan } = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const isSaving = navigation.state === "submitting";

  const [formState, setFormState] = useState(initialSettings);

  const canUseTemplates = activePlan === "Starter" || activePlan === "Pro";
  const canCustomize = activePlan === "Pro";

  useEffect(() => {
    if (actionData?.success) {
      shopify.toast.show("Design saved successfully");
    }
  }, [actionData]);

  const handleSubmit = () => {
    submit(formState, { method: "post" });
  };

  const handleChange = (field) => (value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const applyTemplate = (templateId) => {
    if (!canUseTemplates) return;
    const template = TEMPLATES[templateId];
    if (template) {
      setFormState(prev => ({
        ...prev,
        templateStyle: templateId,
        badgeBgColor: template.badgeBgColor || prev.badgeBgColor,
        badgeTextColor: template.badgeTextColor || prev.badgeTextColor,
        badgePadding: template.badgePadding || prev.badgePadding,
        badgeBorderRadius: template.badgeBorderRadius || prev.badgeBorderRadius,
      }));
    }
  };

  return (
    <Page 
      fullWidth
      primaryAction={{ content: 'Save Design', onAction: handleSubmit, loading: isSaving }}
    >
      <div style={{
        background: "linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)",
        borderRadius: "16px",
        padding: "40px",
        color: "#333",
        marginBottom: "32px",
        boxShadow: "0 10px 30px rgba(255, 154, 158, 0.2)",
      }}>
        <BlockStack gap="200">
          <Text as="h1" variant="heading2xl" fontWeight="bold">Design your perfect badge</Text>
          <p style={{ fontSize: "16px", margin: 0, opacity: 0.8, maxWidth: "600px" }}>
            Match the badge to your brand's unique style. Choose a starting template or build from scratch.
          </p>
        </BlockStack>
      </div>

      <Layout>
        <Layout.Section>
          {!canUseTemplates && (
            <Banner
              title="Unlock Premium Templates"
              tone="warning"
              action={{content: 'Upgrade Plan', onAction: () => navigate('/app/pricing')}}
            >
              <p>You are currently on the Free plan. Upgrade to Starter or Pro to unlock beautiful pre-designed templates!</p>
            </Banner>
          )}
          {!canCustomize && activePlan === "Starter" && (
            <Banner
              title="Unlock Full Customization"
              tone="info"
              action={{content: 'Upgrade to Pro', onAction: () => navigate('/app/pricing')}}
            >
              <p>You are on the Starter plan. Upgrade to Pro to unlock custom colors, padding, and unlimited thresholds!</p>
            </Banner>
          )}
        </Layout.Section>

        <Layout.Section>
          <Card padding="500" roundedAbove="sm">
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Select a Template</Text>
              <Grid>
                {Object.entries(TEMPLATES).map(([id, t]) => (
                  <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 3, xl: 3}} key={id}>
                    <div 
                      onClick={() => applyTemplate(id)}
                      style={{
                        padding: '24px 16px',
                        border: formState.templateStyle === id ? '2px solid #FF6B6B' : '1px solid #F0F0F0',
                        borderRadius: '12px',
                        cursor: canUseTemplates ? 'pointer' : 'not-allowed',
                        textAlign: 'center',
                        backgroundColor: formState.templateStyle === id ? '#FFF5F5' : '#FFFFFF',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                        opacity: !canUseTemplates && id !== 'custom' ? 0.5 : 1,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: t.badgeBgColor,
                          color: t.badgeTextColor,
                          padding: t.badgePadding || '4px 10px',
                          borderRadius: t.badgeBorderRadius || '4px',
                          display: "inline-block",
                          marginBottom: '16px'
                        }}
                      >
                         Preview
                      </div>
                      <Text as="p" variant="bodyMd" fontWeight={formState.templateStyle === id ? "bold" : "regular"}>{t.name}</Text>
                    </div>
                  </Grid.Cell>
                ))}
              </Grid>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card padding="500" roundedAbove="sm">
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Customize Style</Text>
              
              <Select
                label="App Status"
                options={[
                  {label: 'Active (Show Badge)', value: 'true'},
                  {label: 'Disabled (Hide Badge)', value: 'false'}
                ]}
                value={formState.active.toString()}
                onChange={(val) => handleChange('active')(val === 'true')}
              />

              <TextField
                label="Low Stock Threshold"
                type="number"
                value={formState.threshold.toString()}
                onChange={(val) => handleChange("threshold")(parseInt(val, 10))}
                helpText={`Badge will show when inventory is at or below this number. (Max: ${activePlan === 'Free' ? 10 : activePlan === 'Starter' ? 50 : 'Unlimited'})`}
                autoComplete="off"
                max={activePlan === 'Free' ? 10 : activePlan === 'Starter' ? 50 : undefined}
              />
              <TextField
                label="Badge Text"
                value={formState.badgeText}
                onChange={handleChange("badgeText")}
                helpText="Use {count} to display the actual inventory number."
                autoComplete="off"
              />
              <InlineStack gap="400" align="start">
                <TextField
                  label="Background Color"
                  type="color"
                  value={formState.badgeBgColor}
                  onChange={handleChange("badgeBgColor")}
                  autoComplete="off"
                  disabled={!canCustomize}
                />
                <TextField
                  label="Text Color"
                  type="color"
                  value={formState.badgeTextColor}
                  onChange={handleChange("badgeTextColor")}
                  autoComplete="off"
                  disabled={!canCustomize}
                />
              </InlineStack>
              <InlineStack gap="400">
                <TextField
                  label="Font Size"
                  value={formState.badgeFontSize}
                  onChange={handleChange("badgeFontSize")}
                  autoComplete="off"
                  disabled={!canCustomize}
                />
                <TextField
                  label="Padding"
                  value={formState.badgePadding}
                  onChange={handleChange("badgePadding")}
                  autoComplete="off"
                  disabled={!canCustomize}
                />
                <TextField
                  label="Border Radius"
                  value={formState.badgeBorderRadius}
                  onChange={handleChange("badgeBorderRadius")}
                  autoComplete="off"
                  disabled={!canCustomize}
                />
              </InlineStack>

              <div style={{ marginTop: "24px" }}>
                <Text variant="headingMd" as="h2">Live Preview</Text>
                <div style={{ background: "#FDFDFD", padding: "40px", borderRadius: "12px", border: "1px dashed #E0E0E0", marginTop: "16px", textAlign: "center" }}>
                  <div
                    style={{
                      backgroundColor: formState.badgeBgColor,
                      color: formState.badgeTextColor,
                      fontSize: formState.badgeFontSize,
                      padding: formState.badgePadding,
                      borderRadius: formState.badgeBorderRadius,
                      display: "inline-block",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                    }}
                  >
                    {formState.badgeText.replace("{count}", formState.threshold)}
                  </div>
                </div>
              </div>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
