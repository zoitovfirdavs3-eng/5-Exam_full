const authDocs = require("../docs/auth/auth.docs");
const carDocs = require("../docs/car/car.docs");
const categoryDocs = require("../docs/category/category.docs");
const components = require("../docs/components");

module.exports = {
  openapi: "3.0.0",
  info: {
    title: "Mashina bozori API",
    version: "1.0.0",
  },
  components: {
    schemas: {
      ...components.schemas,
    },
    parameters: {
      ...components.parameters,
    },
  },
  paths: {
    ...authDocs.paths,
    ...categoryDocs.paths,
    ...carDocs.paths,
  },
};
