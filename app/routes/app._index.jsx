import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Button,
  InlineGrid,
  CalloutCard
} from "@shopify/polaris";
import { authenticate } from "../shopify.server.js";
import prisma from "../db.server.js";

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  const settings = await prisma.shopSettings.findUnique({
    where: { shop },
  });

  return json({
    shop,
    active: settings?.active ?? true
  });
}

export default function Dashboard() {
  const { active } = useLoaderData();
  const navigate = useNavigate();

  return (
    <Page title="Dashboard">
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <CalloutCard
              title="Customize your Stock Badge"
              illustration="https://cdn.shopify.com/s/assets/admin/checkout/settings-customizecart-705f57c725ac05be5a34ec20c05b94298cb8afd10bf53cb21fd8a68d8ff4d642.svg"
              primaryAction={{
                content: 'Choose a Template',
                onAction: () => navigate("/app/design"),
              }}
            >
              <p>
                Make your store pop with urgency! Choose from our pre-designed templates or customize your own colors and text.
              </p>
            </CalloutCard>

            <InlineGrid columns={2} gap="400">
              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">App Status</Text>
                  <Text as="p" variant="bodyMd">
                    Your Stock Badge is currently <strong>{active ? "Active" : "Disabled"}</strong>.
                  </Text>
                  <Button onClick={() => navigate("/app/design")}>Manage Settings</Button>
                </BlockStack>
              </Card>
              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">Need Help?</Text>
                  <Text as="p" variant="bodyMd">
                    Not sure how to add the badge to your product page? Check out our quick setup guide.
                  </Text>
                  <Button onClick={() => navigate("/app/support")}>View Setup Guide</Button>
                </BlockStack>
              </Card>
            </InlineGrid>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
