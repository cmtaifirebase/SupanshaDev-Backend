const express = require("express");
const {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  updateUserPermissions,
  getUserPermissions,
  updateUserDesignation
} = require("../controllers/userController");
const { 
  authenticate, 
  requireRole,
  requirePermission,
  requireHigherRole
} = require("../middlewares/authMiddleware");

const router = express.Router();

// Public routes
router.post("/", createUser);

// Protected routes (require authentication)
router.use(authenticate);

// Admin-only user management routes
router.get(
  "/",
  (req, res, next) => {
    requireRole("admin", "country-admin", "state-admin")(req, res, (err) => {
      if (err) return next(err);
      requirePermission("manage-users")(req, res, (err) => {
        if (err) return next(err);
        getUsers(req, res, next);
      });
    });
  }
);

router.get(
  "/:id",
  (req, res, next) => {
    requireRole("admin", "country-admin", "state-admin", "regional-admin")(req, res, (err) => {
      if (err) return next(err);
      getUserById(req, res, next);
    });
  }
);

// Update user details (admin or user updating their own profile)
router.put(
  "/:id",
  (req, res, next) => {
    if (req.user._id === req.params.id || req.user.role === 'admin') {
      return next();
    }
    return res.status(403).json({ success: false, message: "Not authorized" });
  },
  updateUser
);

// Update user status (activate/deactivate)
router.patch(
  "/:id/status",
  (req, res, next) => {
    requireRole("admin", "country-admin", "state-admin")(req, res, (err) => {
      if (err) return next(err);
      updateUserStatus(req, res, next);
    });
  }
);

// Update user role (with hierarchy validation)
router.patch(
  "/:id/role",
  (req, res, next) => {
    requireHigherRole()(req, res, (err) => {
      if (err) return next(err);
      updateUserRole(req, res, next);
    });
  }
);

// Update user designation
router.patch(
  "/:id/designation",
  requireRole("admin", "country-admin", "state-admin"),
  updateUserDesignation
);

// Delete user
router.delete(
  "/:id",
  (req, res, next) => {
    requireRole("admin", "country-admin")(req, res, (err) => {
      if (err) return next(err);
      deleteUser(req, res, next);
    });
  }
);

// Special admin-only endpoints
router.get(
  "/admins/list",
  (req, res, next) => {
    requireRole("admin")(req, res, (err) => {
      if (err) return next(err);
    res.json({ message: "Admin list accessed successfully" });
    });
  }
);

// Geo-based user access
router.get(
  "/region/:regionId",
  (req, res, next) => {
    requireRole("admin", "country-admin", "state-admin", "regional-admin")(req, res, (err) => {
      if (err) return next(err);
    res.json({ message: "Regional users accessed successfully" });
    });
  }
);

// Complex permission example - only country admins can manage state admins
router.post(
  "/state-admins",
  (req, res, next) => {
    requireRole("admin", "country-admin")(req, res, (err) => {
      if (err) return next(err);
    res.json({ message: "State admin created successfully" });
    });
  }
);

// Permission hierarchy example
router.get(
  "/permissions/overview",
  (req, res, next) => {
    requireRole("admin")(req, res, (err) => {
      if (err) return next(err);
    res.json({ message: "Permission hierarchy accessed" });
    });
  }
);

// Permission management routes
router.get(
  "/:id/permissions",
  authenticate,
  getUserPermissions
);

router.put(
  "/:id/permissions",
  requireRole("admin", "country-admin", "state-admin"),
  updateUserPermissions
);

module.exports = router;