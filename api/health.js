function setSecurityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cache-Control", "no-store");
}

module.exports = (req, res) => {
  setSecurityHeaders(res);

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      error: "Method Not Allowed",
      message: "Use GET /api/health"
    });
  }

  return res.status(200).json({
    status: "ok",
    service: "qenovra-lab-api",
    timestamp: new Date().toISOString()
  });
};
