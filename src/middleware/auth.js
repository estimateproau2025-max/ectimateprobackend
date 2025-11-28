const jwt = require("jsonwebtoken");
const config = require("../config");
const Builder = require("../models/Builder");

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, config.jwt.accessTokenSecret);
    const builder = await Builder.findById(payload.id);

    if (!builder || builder.isAccessDisabled) {
      return res.status(401).json({ message: "Account unavailable" });
    }

    req.user = builder;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

function authorize(roles = []) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!allowedRoles.length) {
      return next();
    }

    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return next();
  };
}

module.exports = {
  authenticate,
  authorize,
};



