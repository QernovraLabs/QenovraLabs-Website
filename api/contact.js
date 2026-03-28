const RATE_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 8;
const MAX_BODY_BYTES = 8 * 1024;

const requestStore = new Map();

function setSecurityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cache-Control", "no-store");
}

function parseAllowedOrigins() {
  const raw = process.env.ALLOWED_ORIGINS || "";
  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function isOriginAllowed(req) {
  const origin = req.headers.origin;
  if (!origin) return true;

  const allowedOrigins = parseAllowedOrigins();
  if (!allowedOrigins.length) {
    const host = req.headers.host;
    if (!host) return false;

    try {
      const originUrl = new URL(origin);
      return originUrl.host === host;
    } catch (error) {
      return false;
    }
  }

  return allowedOrigins.includes(origin);
}

function sanitizeText(value) {
  return String(value || "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isEmailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getClientKey(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }

  return req.socket?.remoteAddress || "unknown";
}

function isRateLimited(clientKey) {
  const now = Date.now();
  const current = requestStore.get(clientKey) || [];
  const recent = current.filter((ts) => now - ts < RATE_WINDOW_MS);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    requestStore.set(clientKey, recent);
    return true;
  }

  recent.push(now);
  requestStore.set(clientKey, recent);
  return false;
}

module.exports = (req, res) => {
  setSecurityHeaders(res);

  if (!isOriginAllowed(req)) {
    return res.status(403).json({
      error: "Forbidden",
      message: "Request origin is not allowed"
    });
  }

  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({
      error: "Method Not Allowed",
      message: "Use POST /api/contact"
    });
  }

  const contentType = req.headers["content-type"] || "";
  if (!String(contentType).toLowerCase().includes("application/json")) {
    return res.status(415).json({
      error: "Unsupported Media Type",
      message: "Content-Type must be application/json"
    });
  }

  const contentLengthHeader = req.headers["content-length"];
  const contentLength = Number(contentLengthHeader || 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return res.status(413).json({
      error: "Payload Too Large",
      message: "Request body is too large"
    });
  }

  const clientKey = getClientKey(req);
  if (isRateLimited(clientKey)) {
    return res.status(429).json({
      error: "Too Many Requests",
      message: "Please try again later"
    });
  }

  let payload = req.body || {};
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload);
    } catch (error) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid JSON body"
      });
    }
  }

  const name = sanitizeText(payload.name);
  const email = sanitizeText(payload.email).toLowerCase();
  const message = sanitizeText(payload.message);

  if (!name || !email || !message) {
    return res.status(400).json({
      error: "Bad Request",
      message: "name, email and message are required"
    });
  }

  if (name.length < 2 || name.length > 80) {
    return res.status(400).json({
      error: "Bad Request",
      message: "name must be between 2 and 80 characters"
    });
  }

  if (!isEmailValid(email) || email.length > 254) {
    return res.status(400).json({
      error: "Bad Request",
      message: "email is invalid"
    });
  }

  if (message.length < 10 || message.length > 2000) {
    return res.status(400).json({
      error: "Bad Request",
      message: "message must be between 10 and 2000 characters"
    });
  }

  return res.status(200).json({
    success: true,
    message: "Contact request received",
    data: {
      name,
      email,
      message,
      receivedAt: new Date().toISOString()
    }
  });
};
