module.exports = {
  paths: {
    "/api/car/create": {
      post: {
        summary: "Create a new car",
        tags: ["Cars"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Car" },
            },
          },
        },
        responses: {
          404: { description: "Category not found" },
          400: { description: "Validation error" },
          201: { description: "Car successfully created" },
        },
      },
    },
    "/api/car/all": {
      get: {
        summary: "Get all cars",
        tags: ["Cars"],
        responses: {
          200: { description: "Cars list" },
        },
      },
    },
    "/api/car/{id}": {
      get: {
        summary: "Get one car",
        tags: ["Cars"],
        parameters: [{ $ref: "#/components/parameters/CarId" }],
        responses: {
          400: { description: "Invalid object id" },
          404: { description: "Car not found" },
          200: { description: "Car" },
        },
      },
      delete: {
        summary: "Delete one car by id",
        tags: ["Cars"],
        parameters: [{ $ref: "#/components/parameters/CarId" }],
        responses: {
          400: { description: "Invalid object id" },
          404: { description: "Car not found" },
          200: { description: "Car successfully deleted" },
        },
      },
      put: {
        summary: "Update one car by id",
        tags: ["Cars"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CarPut" },
            },
          },
        },
        parameters: [{ $ref: "#/components/parameters/CarId" }],
        responses: {
          400: { description: "Invalid object id" },
          404: { description: "Car not found" },
          200: { description: "Car successfully updated" },
        },
      },
    },
  },
};
