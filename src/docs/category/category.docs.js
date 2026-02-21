module.exports = {
  paths: {
    "/api/category/create": {
      post: {
        summary: "Create catgory",
        tags: ["Categories"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Category" },
            },
          },
        },
        responses: {
          400: { description: "Validation error" },
          201: { description: "Category successfully created" },
        },
      },
    },
    "/api/category/all": {
      get: {
        summary: "Get all categories",
        tags: ["Categories"],
        responses: {
          200: { description: "Categories list" },
        },
      },
    },
    "/api/category/{id}": {
      get: {
        summary: "Get one category",
        tags: ["Categories"],
        parameters: [{$ref: "#/components/parameters/CategoryId"}],
        responses: {
          400: { description: "Invalid object id" },
          404: { description: "Category not found" },
          200: { description: "Category" },
        },
      },
      delete: {
        summary: "Delete one category by id",
        tags: ["Categories"],
        parameters: [{$ref: "#/components/parameters/CategoryId"}],
        responses: {
          400: { description: "Invalid object id" },
          404: { description: "Category not found" },
          200: { description: "Category successfully deleted" },
        },
      },
      put: {
        summary: "Update one category by id",
        tags: ["Categories"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Category" },
            },
          },
        },
        parameters: [{$ref: "#/components/parameters/CategoryId"}],
        responses: {
          400: { description: "Invalid object id" },
          404: { description: "Category not found" },
          200: { description: "Category successfully updated" },
        },
      },
    },
  },
};
