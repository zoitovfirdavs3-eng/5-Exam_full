module.exports = {
  schemas: {
    Car: {
      type: "object",
      properties: {
        car_name: {
          type: "string",
          default: "Malibu",
          minLength: 2,
        },
        car_category: {
          type: "string",
          default: "6995cd9f519cbcfd2d52a79d",
        },
        car_tonirovka: {
          type: "string",
          default: "yo'q",
          enum: ["bor", "yo'q"],
          lowercase: true,
        },
        car_motor: {
          type: "string",
          default: "1.6",
        },
        car_year: {
          type: "number",
          default: 2000,
        },
        car_color: {
          type: "string",
          default: "Oq",
        },
        car_distance: {
          type: "number",
          default: 1000,
        },
        car_gearbook: {
          type: "string",
          default: "mexanik",
          enum: ["avtomat", "mexanik"],
          lowercase: true,
        },
        car_description: {
          type: "string",
          default: "Information about car",
          minLength: 10,
        },
        car_price: {
          type: "number",
          default: 3000,
        },
        car_image: {
          type: "string",
          default: "photo.png",
        },
      },
      required: [
        "car_name",
        "car_category",
        "car_motor",
        "car_year",
        "car_color",
        "car_distance",
        "car_description",
        "car_price",
      ],
    },
    CarPut: {
      type: "object",
      properties: {
        car_name: {
          type: "string",
          default: "Malibu",
          minLength: 2,
        },
        car_category: {
          type: "string",
          default: "6995cd9f519cbcfd2d52a79d",
        },
        car_tonirovka: {
          type: "string",
          default: "bor",
          enum: ["bor", "yo'q"],
          lowercase: true,
        },
        car_motor: {
          type: "string",
          default: "1.8",
        },
        car_year: {
          type: "number",
          default: 2024,
        },
        car_color: {
          type: "string",
          default: "Oq",
        },
        car_distance: {
          type: "number",
          default: 1000,
        },
        car_gearbook: {
          type: "string",
          default: "mexanik",
          enum: ["avtomat", "mexanik"],
          lowercase: true,
        },
        car_description: {
          type: "string",
          default: "Information about car",
          minLength: 10,
        },
        car_price: {
          type: "number",
          default: 3000,
        },
        car_image: {
          type: "string",
          default: "photo.png",
        },
      },
    },
    UserRegister: {
      type: "object",
      properties: {
        first_name: {
          type: "string",
          default: "Person",
        },
        last_name: {
          type: "string",
          default: "Personov"
        },
        age: {
          type: "number",
          default: 99
        },
        email: {
          type: "string",
          default: "email@gmail.com"
        },
        password: {
          type: "string",
          default: "person123"
        },
      },
      required: ["first_name", "last_name", "age", "email", "password"],
    },
    UserVerify: {
      type: "object",
      properties: {
        email: {
          type: "string",
          default: "email@gmail.com"
        },
        otp: {
          type: "number",
          default: "123456"
        }
      },
      required: ["email", "otp"],
    },
    UserResendOtpOrForgotPassword: {
      type: "object",
      properties: {
        email: {
          type: "string",
          default: "email@gmail.com"
        }
      },
      required: ["email"],
    },
    UserLogin: {
      type: "object",
      properties: {
        email: {
          type: "string",
          default: "email@gmail.com"
        },
        password: {
          type: "string",
          default: "person123"
        },
      },
      required: ["email", "password"],
    },
    UserChangePassword: {
      type: "object",
      properties: {
        email: {
          type: "string",
          default: "email@gmail.com"
        },
        new_password: {
          type: "String",
          default: "new_password123"
        }
      },
      required: ["email", "new_password"],
    },
    Category: {
      type: "object",
      properties: {
        category_name: {
          type: "string",
          default: "Rols Roys"
        }
      },
      required: ["category_name"],
    },
  },
  parameters: {
    CategoryId: {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string" },
      description: "Mongodb ObjectId",
      default: "6995d0136681f866a2a7e04e",
    },
    CarId: {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "string" },
      description: "Mongodb ObjectId",
      default: "6995d0136681f866a2a7e04e",
    },
  },
};
