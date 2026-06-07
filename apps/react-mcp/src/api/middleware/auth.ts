import type {AuthWorkerResponse} from "../types/auth";
import type {HonoContext} from "../types/context";
import type {Context, Next} from "hono";

import {AnalyticsErrorEvent, AnalyticsEvent} from "../types/analytics";
import {getApp} from "../utils/get-client";

/**
 * Auth middleware
 * - Production: Service binding to api
 *
 * Uses analytics service from context (set by analytics middleware)
 */
export const authMiddleware = async (c: Context<HonoContext>, next: Next) => {
  const apiKey = c.req.header("X-API-Key");

  if (!apiKey) {
    return next();
  }

  const serviceToken = c.env.SERVICE_AUTH_TOKEN;

  if (!serviceToken) {
    console.warn("[Auth] SERVICE_AUTH_TOKEN not configured - skipping validation");

    return next();
  }

  const startTime = Date.now();
  const analytics = c.get("analytics");
  const app = getApp(c);
  const apiVersion = c.req.path.startsWith("/v1/") ? "v1" : "legacy";

  try {
    const platformApi = c.env.PLATFORM_API;

    let response;

    if (platformApi) {
      // Production: Service binding
      response = await platformApi.fetch("https://api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Service-Auth-Token": serviceToken,
        },
        body: JSON.stringify({apiKey}),
      });
    } else {
      console.warn("[Auth] No auth service available");

      return next();
    }

    const result = (await response.json()) as AuthWorkerResponse;

    if (!result.success) {
      console.error(`[Auth] Failed: ${result.error.code} - ${result.error.message}`);

      // Track auth failure
      analytics.track({
        event: AnalyticsErrorEvent.AUTH_FAILED,
        properties: {
          endpoint: "auth",
          app,
          apiVersion,
          responseTime: Date.now() - startTime,
          errorCode: result.error.code,
          errorMessage: result.error.message,
        },
      });

      return c.json(
        {
          error: result.error.code,
          message: result.error.message,
        },
        response.status as 401 | 403 | 500,
      );
    }

    // Set user ID in context for downstream middleware/handlers
    c.set("userId", result.data.user.id);

    // Update analytics distinctId with authenticated user
    analytics.distinctId = result.data.user.id;

    // Track successful auth
    analytics.track({
      event: AnalyticsEvent.AUTH_SUCCESS,
      properties: {
        endpoint: "auth",
        app,
        apiVersion,
        responseTime: Date.now() - startTime,
        apiKeyId: result.data.apiKeyId,
        apiKeyName: result.data.apiKey.name,
      },
    });

    return next();
  } catch (error) {
    console.error("[Auth] Error:", error instanceof Error ? error.message : String(error));

    // Track auth error
    analytics.trackError({
      error,
      errorEvent: AnalyticsErrorEvent.AUTH_ERROR,
      fallbackMessage: "Authentication service unavailable",
      properties: {
        endpoint: "auth",
        app,
        apiVersion,
        responseTime: Date.now() - startTime,
      },
    });

    return c.json(
      {
        error: "INTERNAL_ERROR",
        message: "Authentication service unavailable",
      },
      500,
    );
  }
};
