const { Router } = require("express");
const authRouter = require("./auth.routes");
const categoryRouter = require("./category.routes");
const carRouter = require("./car.routes");

const mainRouter = Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/category", categoryRouter);
mainRouter.use("/car", carRouter);

module.exports = mainRouter;