import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  DataTable,
  Badge
} from "@shopify/polaris";
import { authenticate } from "../shopify.server.js";
import prisma from "../db.server.js";

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(today.getDate() - 13);
  fourteenDaysAgo.setHours(0, 0, 0, 0);

  const rawMetrics = await prisma.dailyMetrics.findMany({
    where: {
      shop,
      date: {
        gte: fourteenDaysAgo,
        lte: today
      }
    },
    orderBy: {
      date: 'asc'
    }
  });

  // Map into a perfect 14 day array (filling in missing days with 0)
  const chartData = [];
  let maxViews = 0;
  
  for (let i = 13; i >= 0; i--) {
    const targetDate = new Date();
    targetDate.setDate(today.getDate() - i);
    const dateStr = targetDate.toISOString().split('T')[0];
    
    // Find if we have a metric for this date
    const metric = rawMetrics.find(m => new Date(m.date).toISOString().split('T')[0] === dateStr);
    const views = metric ? metric.views : 0;
    const alerts = metric ? metric.alerts : 0;
    
    if (views > maxViews) maxViews = views;
    
    chartData.push({
      date: dateStr,
      displayDate: targetDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      views,
      alerts
    });
  }

  // Ensure maxViews is at least 10 for chart scaling purposes
  if (maxViews < 10) maxViews = 10;

  return json({
    chartData,
    maxViews
  });
}

export default function Analytics() {
  const { chartData, maxViews } = useLoaderData();

  // Prepare table rows
  const rows = chartData.map((data) => [
    data.displayDate,
    data.views.toLocaleString(),
    data.alerts.toLocaleString(),
    <Badge tone={data.views > 0 ? "success" : "new"}>{data.views > 0 ? "Active" : "Quiet"}</Badge>
  ]).reverse(); // Show newest first in the table

  return (
    <Page title="Analytics" subtitle="Track your badge performance over the last 14 days">
      <Layout>
        <Layout.Section>
          <Card padding="500">
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">Views Over Time</Text>
              
              {/* CSS Bar Chart */}
              <div style={{ 
                height: "250px", 
                display: "flex", 
                alignItems: "flex-end", 
                justifyContent: "space-between", 
                gap: "8px", 
                padding: "20px 0",
                borderBottom: "1px solid #EBEBEB"
              }}>
                {chartData.map((data, index) => {
                  const heightPercent = Math.max((data.views / maxViews) * 100, 2); // Minimum 2% height for visibility
                  return (
                    <div key={index} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: "8px" }}>
                      <div 
                        title={`${data.displayDate}: ${data.views} views`}
                        style={{ 
                          width: "100%", 
                          maxWidth: "40px", 
                          height: `${heightPercent}%`, 
                          background: "linear-gradient(180deg, #FF6B6B 0%, #FF8E53 100%)", 
                          borderRadius: "4px 4px 0 0",
                          transition: "height 0.3s ease",
                          cursor: "pointer"
                        }} 
                      />
                      <Text as="span" variant="bodyXs" tone="subdued" alignment="center">
                        {data.displayDate.split(' ')[1]} {/* Just show the day number to fit */}
                      </Text>
                    </div>
                  );
                })}
              </div>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card padding="0">
            <DataTable
              columnContentTypes={[
                'text',
                'numeric',
                'numeric',
                'text',
              ]}
              headings={[
                'Date',
                'Badge Views',
                'Low Stock Alerts',
                'Status',
              ]}
              rows={rows}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
