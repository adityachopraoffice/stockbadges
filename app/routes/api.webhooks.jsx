import { authenticate } from "../shopify.server.js";
import prisma from "../db.server.js";

export const action = async ({ request }) => {
  const { topic, shop, session, admin, payload } = await authenticate.webhook(request);

  // The admin context isn't returned if the webhook fired after a shop was uninstalled.
  if (!admin && topic !== "APP_UNINSTALLED" && topic !== "CUSTOMERS_DATA_REQUEST" && topic !== "CUSTOMERS_REDACT" && topic !== "SHOP_REDACT" && topic !== "APP_SUBSCRIPTIONS_UPDATE") {
    throw new Response();
  }

  // The `authenticate.webhook` method securely verifies the HMAC signature from Shopify automatically.
  // Shopify requires these webhooks to return a 200 OK within 5 seconds.
  
  switch (topic) {
    case "APP_UNINSTALLED":
      if (shop) {
        await prisma.session.deleteMany({ where: { shop } });
      }
      break;

    case "CUSTOMERS_DATA_REQUEST":
      // Customers data request webhook
      // We don't store customer personal data, so nothing to return here.
      break;

    case "CUSTOMERS_REDACT":
      // Customers redact webhook
      // We don't store customer personal data, so nothing to delete here.
      break;

    case "SHOP_REDACT":
      // Shop redact webhook
      // E.g., purge shop settings and analytics from the database within 48 hours.
      // We can handle db cleanup here.
      if (shop) {
         await prisma.shopSettings.deleteMany({ where: { shop } });
         await prisma.dailyMetrics.deleteMany({ where: { shop } });
      }
      break;

    case "APP_SUBSCRIPTIONS_UPDATE":
      if (shop && payload?.app_subscription) {
        const status = payload.app_subscription.status;
        const planName = payload.app_subscription.name;
        
        let newPlan = "Free";
        if (status === "ACTIVE") {
          newPlan = planName;
        }

        await prisma.shopSettings.updateMany({
          where: { shop },
          data: { plan: newPlan },
        });
      }
      break;

    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  throw new Response();
};
