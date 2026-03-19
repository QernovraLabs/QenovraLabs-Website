module.exports = (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      error: "Method Not Allowed",
      message: "Use POST /api/contact"
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

  const { name, email, message } = payload;

  if (!name || !email || !message) {
    return res.status(400).json({
      error: "Bad Request",
      message: "name, email and message are required"
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
