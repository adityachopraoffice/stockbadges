import { json } from "@remix-run/node";
import prisma from "../db.server.js";

// Allow CORS since it's called from storefront
export const action = async ({ request }) => {
  if (request.method !== "POST" && request.method !== "OPTIONS") {
    return json({ message: "Method not allowed" }, { status: 405 });
  }

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const data = await request.json();
    const { shop, eventType } = data; // eventType could be "view" or "alert"

    if (!shop || !eventType) {
      return json({ error: "Missing required fields" }, { status: 400, headers: corsHeaders });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize to midnight UTC

    // Upsert logic for DailyMetrics
    const existingMetric = await prisma.dailyMetrics.findUnique({
      where: {
        shop_date: {
          shop,
          date: today,
        },
      },
    });

    if (existingMetric) {
      await prisma.dailyMetrics.update({
        where: { id: existingMetric.id },
        data: {
          views: eventType === "view" || eventType === "alert" ? { increment: 1 } : undefined, // an alert is also a view
          alerts: eventType === "alert" ? { increment: 1 } : undefined,
        },
      });
    } else {
      await prisma.dailyMetrics.create({
        data: {
          shop,
          date: today,
          views: 1, // an alert is also a view
          alerts: eventType === "alert" ? 1 : 0,
        },
      });
    }

    return json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    console.error("Error tracking metric:", error);
    return json({ error: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
};
