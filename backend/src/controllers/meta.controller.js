exports.getMeta = async (req, res) => {
  const port = Number(process.env.PORT) || 3000;
  res.json({
    status: 200,
    data: {
      port,
      apiBaseUrl: `http://localhost:${port}/api`,
      environment: process.env.NODE_ENV || "development",
    },
  });
};
