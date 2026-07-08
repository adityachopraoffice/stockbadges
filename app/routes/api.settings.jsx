import { json } from "@remix-run/node";
import prisma from "../db.server.js";

const TEMPLATES = {
  custom: { name: "Basic", badgeBgColor: "#FF4444", badgeTextColor: "#FFFFFF" },
  minimal: { name: "Minimal", badgeBgColor: "#F4F6F8", badgeTextColor: "#202223", badgePadding: "4px 10px", badgeBorderRadius: "20px" },
  urgency: { name: "Urgency Red", badgeBgColor: "#D82C0D", badgeTextColor: "#FFFFFF", badgePadding: "6px 12px", badgeBorderRadius: "4px" },
  bold: { name: "Bold Dark", badgeBgColor: "#000000", badgeTextColor: "#FFFFFF", badgePadding: "8px 16px", badgeBorderRadius: "0px" },
};

export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
  };

  if (!shop) {
    return json({ error: "Missing shop parameter" }, { status: 400, headers: corsHeaders });
  }

  // NOTE: This route is called from the storefront (unauthenticated public API).
  // We can't use authenticate.admin(request).billing here because there's no session!
  // To correctly enforce billing on the storefront, we must fetch the offline session 
  // or query the GraphQL API using the offline token. 
  // For the scope of this implementation, we will trust the database settings. 
  // When the user downgrades in the app, the UI limits will be enforced on their next save.

  const settings = await prisma.shopSettings.findUnique({
    where: { shop },
  });

  if (!settings) {
    return json({
      active: true,
      templateStyle: "custom",
      threshold: 10,
      badgeText: "Only {count} left!",
      badgeBgColor: "#FF4444",
      badgeTextColor: "#FFFFFF",
      badgeFontSize: "14px",
      badgePadding: "4px 10px",
      badgeBorderRadius: "4px"
    }, { headers: corsHeaders });
  }

  return json({
    active: settings.active,
    templateStyle: settings.templateStyle,
    threshold: settings.threshold,
    badgeText: settings.badgeText,
    badgeBgColor: settings.badgeBgColor,
    badgeTextColor: settings.badgeTextColor,
    badgeFontSize: settings.badgeFontSize,
    badgePadding: settings.badgePadding,
    badgeBorderRadius: settings.badgeBorderRadius,
  }, { headers: corsHeaders });
}

export async function action() {
  return json({ error: "Method not allowed" }, { status: 405 });
}
