const express = require("express");
const { 
  loginUser, 
  registerUser, 
  getUserDetails,
  logoutUser,
  updateUser,
  getAllUsers
} = require("../controllers/authController");
const { 
  authenticate, 
  requireRole,
  requirePermission,
  requireGeoAccess,
  requireHigherRole
} = require("../middlewares/authMiddleware");

const router = express.Router();

// Public routes

// Auth routes
router.post("/register", registerUser); // Only registers normal users (role: 'user')
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.get("/me", authenticate, getUserDetails);

router.get("/users", authenticate,requireRole("admin"), getAllUsers)
router.put("/update", authenticate, requireRole("admin"), updateUser);

// Authenticated user routes
router.get("/profile", authenticate, getUserDetails);
router.put("/profile", authenticate, updateUser); // Admin can update users' roles, geo, level, etc.

// Role-based example
router.get(
  "/admin/dashboard", 
  authenticate, 
  requireRole("admin", "country-admin"), 
  (req, res) => {
    res.json({ message: "Admin dashboard accessed successfully" });
  }
);

// Permission-based example
router.get(
  "/reports", 
  authenticate, 
  requirePermission("view-reports"), 
  (req, res) => {
    res.json({ message: "Reports accessed successfully" });
  }
);

// Geo-level access example
router.get(
  "/regional-data", 
  authenticate, 
  requireGeoAccess("region"), 
  (req, res) => {
    res.json({ message: "Regional data accessed successfully" });
  }
);

// Admin management (only higher roles can create admins or elevate others)
router.post(
  "/admins", 
  authenticate, 
  requireHigherRole(), 
  (req, res) => {
    res.json({ message: "Admin created successfully" });
  }
);

// Complex example: All protections combined
router.get(
  "/country-dashboard", 
  authenticate,
  requireRole("country-admin"),
  requireGeoAccess("country"),
  requirePermission("view-dashboard"),
  (req, res) => {
    res.json({ message: "Country dashboard accessed successfully" });
  }
);

module.exports = router;
