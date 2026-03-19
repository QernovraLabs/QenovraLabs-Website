module.exports = (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "qenovra-labs-api",
    timestamp: new Date().toISOString()
  });
};
