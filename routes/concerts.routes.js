const express = require("express")
const router = express.Router()
const cloudinary = require ("../middlewares/cloudinary.config")
const Concert = require("../models/Concert.model")
const Booking = require("../models.Booking")
const { verifyToken, verufyadmin } = require("../middlewares/auth.middlewares")

//POST /api/events (Admin)

router.post("/", verifyToken, isAdmin, async (req, res, next) => {
  try {
    const event = await Event.create({ ...req.body, createdBy: req.user._id });
    const populated = await event.populate("venue", "name city");
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
});



module.exports = router