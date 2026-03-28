import cors from "cors";
import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";

import { getAccessToken, initiateMpesaPayment } from "./mpesa";

const corsMiddleware = cors({ origin: true });

type RequestBody = {
  phone?: string;
  amount?: number;
};

function normalizePath(pathValue: string): string {
  const trimmed = (pathValue || "/").replace(/\/+$/, "");
  return trimmed || "/";
}

function matchesRoute(pathValue: string, route: string): boolean {
  const normalizedPath = normalizePath(pathValue);
  const normalizedRoute = normalizePath(route);
  return normalizedPath === normalizedRoute || normalizedPath.endsWith(normalizedRoute);
}

export const mpesaProxy = onRequest({ region: "us-central1" }, (req, res) => {
  corsMiddleware(req, res, async () => {
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (matchesRoute(req.path, "/health") && req.method === "GET") {
      res.status(200).json({ ok: true, service: "lifelink-mpesa-proxy" });
      return;
    }

    try {
      if (matchesRoute(req.path, "/access-token") && req.method === "POST") {
        const token = await getAccessToken();
        res.status(200).json({ access_token: token });
        return;
      }

      if (matchesRoute(req.path, "/stk-push") && req.method === "POST") {
        const body = req.body as RequestBody;
        const phone = body?.phone?.trim();
        const amount = Number(body?.amount);

        if (!phone || Number.isNaN(amount) || amount <= 0) {
          res.status(400).json({ message: "phone and amount are required." });
          return;
        }

        const response = await initiateMpesaPayment({
          phone,
          amount
        });

        res.status(200).json(response);
        return;
      }

      res.status(404).json({ message: "Route not found." });
    } catch (error) {
      logger.error("M-Pesa proxy error", error);
      const message = error instanceof Error ? error.message : "Unexpected payment error";
      res.status(500).json({ message });
    }
  });
});
