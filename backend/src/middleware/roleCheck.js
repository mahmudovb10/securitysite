const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Access denied",
        message: `This action requires ${roles.join(" or ")} role`,
      });
    }

    next();
  };
};

// Specific role checkers
const requireAdmin = requireRole("admin");
const requireUser = requireRole("user", "admin");

module.exports = {
  requireRole,
  requireAdmin,
  requireUser,
};
