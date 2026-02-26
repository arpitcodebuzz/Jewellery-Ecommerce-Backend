export default function cleanEmptyFields(req, res, next) {
  if (!req.body) return next();

  Object.keys(req.body).forEach((key) => {
    if (req.body[key] === '') {
      req.body[key] = null;
    }
  });

  next();
}
