const router = require("express").Router();

// ℹ️ Organize and connect all your route files here.

const authRoutes = require("./auth.routes")
router.use("/auth", authRoutes)

const userRoutes = require("./users.routes")
router.use("/users", userRoutes)

const venueRoutes = require("./venues.routes")
router.use("/venues", venueRoutes)

const concertRoutes = require("./concerts.routes")
router.use("concerts", concertRoutes)



const uploadRoutes = require("./upload.routes");
router.use("/upload", uploadRoutes);



module.exports = router;
