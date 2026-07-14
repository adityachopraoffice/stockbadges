import "@shopify/shopify-app-remix/adapters/node";
import {
  AppDistribution,
  shopifyApp,
  BillingInterval,
  DeliveryMethod,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server.js";

export const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY || "",
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: "2024-07",
  scopes: process.env.SCOPES?.split(",") || ["read_products", "read_inventory"],
  appUrl: process.env.SHOPIFY_APP_URL || process.env.HOST || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  isEmbeddedApp: true,
  useOnlineTokens: true,
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/api/webhooks",
    },
    CUSTOMERS_DATA_REQUEST: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/api/webhooks",
    },
    CUSTOMERS_REDACT: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/api/webhooks",
    },
    SHOP_REDACT: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/api/webhooks",
    },
  },
  billing: {
    "Starter": {
      lineItems: [{
        amount: 9.99,
        currencyCode: "USD",
        interval: BillingInterval.Every30Days,
      }],
    },
    "Pro": {
      lineItems: [{
        amount: 19.99,
        currencyCode: "USD",
        interval: BillingInterval.Every30Days,
      }],
    },
  },
  future: {
    unstable_newEmbeddedAuthStrategy: true,
  },
});

export const apiVersion = "2024-07";
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
