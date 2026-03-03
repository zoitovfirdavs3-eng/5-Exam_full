// Meta endpoint for frontend to discover API port
exports.getMeta = async (req, res) => {
  console.log("🔍 Meta endpoint called");
  const port = Number(process.env.PORT) || 3000;
  console.log("🔍 PORT from env:", process.env.PORT);
  console.log("🔍 Final port:", port);
  
  res.json({
    status: 200,
    data: {
      port: port,
      apiBaseUrl: `http://localhost:${port}/api`,
      environment: process.env.NODE_ENV || 'development'
    }
  });
};
