import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  List,
  Icon,
  InlineStack,
  Button
} from "@shopify/polaris";
import { ChatIcon, QuestionCircleIcon, NoteIcon } from "@shopify/polaris-icons";

export default function Support() {
  return (
    <Page fullWidth>
      <div style={{
        background: "linear-gradient(135deg, #FF7E5F 0%, #FEB47B 100%)",
        borderRadius: "16px",
        padding: "40px",
        color: "white",
        marginBottom: "32px",
        textAlign: "center",
        boxShadow: "0 10px 30px rgba(255, 126, 95, 0.2)",
      }}>
        <BlockStack gap="200" inlineAlign="center">
          <Text as="h1" variant="heading2xl" fontWeight="bold">We're here to help!</Text>
          <p style={{ fontSize: "16px", margin: 0, opacity: 0.9, maxWidth: "600px" }}>
            Got questions? We've got answers. Explore our guides below or reach out to our support team.
          </p>
        </BlockStack>
      </div>

      <Layout>
        <Layout.Section>
          <Card padding="500" roundedAbove="sm">
            <BlockStack gap="400">
              <InlineStack gap="200" align="start" blockAlign="center">
                <div style={{ background: "#FFF3E0", padding: "8px", borderRadius: "8px", color: "#FF9800" }}>
                  <Icon source={NoteIcon} />
                </div>
                <Text variant="headingLg" as="h2">Quick Setup Guide</Text>
              </InlineStack>
              
              <div style={{ background: "#FAFAFA", padding: "24px", borderRadius: "12px", border: "1px solid #F0F0F0" }}>
                <Text variant="headingMd" as="h3">How to add Scarcity Badge Pro to your product page</Text>
                <div style={{ height: "16px" }} />
                <List type="number" spacing="loose">
                  <List.Item>Go to your Shopify Admin and click on **Online Store** &gt; **Themes**.</List.Item>
                  <List.Item>Click the **Customize** button on your active theme.</List.Item>
                  <List.Item>In the Theme Editor, use the top dropdown menu to navigate to **Products** &gt; **Default product**.</List.Item>
                  <List.Item>On the left sidebar, under the "Product Information" section, click **Add block**.</List.Item>
                  <List.Item>Select **Scarcity Badge Pro** from the list of blocks.</List.Item>
                  <List.Item>Drag the Scarcity Badge Pro block to your desired position (e.g., just below the Price).</List.Item>
                  <List.Item>Click **Save** in the top right corner.</List.Item>
                </List>
              </div>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <BlockStack gap="400">


            <Card padding="500" roundedAbove="sm">
              <BlockStack gap="400">
                <InlineStack gap="200" align="start" blockAlign="center">
                  <div style={{ background: "#E3F2FD", padding: "8px", borderRadius: "8px", color: "#2196F3" }}>
                    <Icon source={QuestionCircleIcon} />
                  </div>
                  <Text variant="headingMd" as="h2">FAQ</Text>
                </InlineStack>
                <BlockStack gap="200">
                  <Text variant="bodyMd" fontWeight="bold">Why isn't the badge showing?</Text>
                  <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                    Ensure your product's inventory is tracking in Shopify, and the stock level is at or below the threshold you set in the Design tab.
                  </p>
                </BlockStack>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
