import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  List
} from "@shopify/polaris";

export default function Support() {
  return (
    <Page title="Support & Guide">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">How to add the Stock Badge to your store</Text>
              <List type="number">
                <List.Item>Go to your Shopify Admin and click on **Online Store** &gt; **Themes**.</List.Item>
                <List.Item>Click the **Customize** button on your active theme.</List.Item>
                <List.Item>In the Theme Editor, use the top dropdown menu to navigate to **Products** &gt; **Default product**.</List.Item>
                <List.Item>On the left sidebar, under the "Product Information" section, click **Add block**.</List.Item>
                <List.Item>Select **Stock Badge** from the list of blocks.</List.Item>
                <List.Item>Drag the Stock Badge block to your desired position (e.g., under the Price).</List.Item>
                <List.Item>Click **Save** in the top right corner.</List.Item>
              </List>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
