const { HttpError } = require("../utils/errors");

module.exports = function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    if (error) {
      return next(new HttpError(400, error.details.map(d => d.message).join(", ")));
    }
    req.body = value;
    next();
  };
};
