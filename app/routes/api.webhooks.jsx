import { authenticate } from "../shopify.server.js";

export const action = async ({ request }) => {
  const { topic, shop, session, admin, payload } = await authenticate.webhook(request);

  if (!admin) {
    // The admin context isn't returned if the webhook fired after a shop was uninstalled.
    throw new Response();
  }

  // The `authenticate.webhook` method securely verifies the HMAC signature from Shopify automatically.
  // Shopify requires these webhooks to return a 200 OK within 5 seconds.
  
  switch (topic) {
    case "APP_UNINSTALLED":
      if (session) {
        // await db.session.deleteMany({ where: { shop } });
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
      break;

    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  throw new Response();
};
