// middleware/validate.js
//
// Turns an array of express-validator chains into a single Express
// middleware: runs every chain, and if any of them failed, short-circuits
// with a clean 400 instead of letting bad input fall through into a
// controller and blow up as an opaque 500.
const { validationResult } = require("express-validator");

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  };
};

module.exports = validate;
