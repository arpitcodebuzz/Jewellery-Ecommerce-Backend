// common/middlewares/validate.js
export default (schemas) => (req, res, next) => {
  try {
    if (schemas.params) {
      const { error } = schemas.params.validate(req.params);
      if (error) {
        return res.status(422).json({
          success: false,
          message: error.details[0].message
        });
      }
    }

    if (schemas.body) {
      const { error } = schemas.body.validate(req.body);
      if (error) {
        return res.status(422).json({
          success: false,
          message: error.details[0].message
        });
      }
    }

    if (schemas.query) {
      const { error } = schemas.query.validate(req.query);
      if (error) {
        return res.status(422).json({
          success: false,
          message: error.details[0].message
        });
      }
    }

    next();
  } catch (err) {
    next(err);
  }
};
