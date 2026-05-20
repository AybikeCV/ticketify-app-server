const router = require("express").Router();

// ℹ️ Organize and connect all your route files here.

const uploadRoutes = require("./upload.routes");
router.use("/upload", uploadRoutes);

module.exports = router;
