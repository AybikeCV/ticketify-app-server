const express = require("express")
const router = express.Router()
const cloudinary = require ("../middlewares/cloudinary.config")
const Concert = require("../models/Concert.model")
const Booking = require("../models/Booking.model")
const { verifyToken, verifyAdmin } = require("../middlewares/auth.middlewares")

//POST /api/bookings (Private) create a booking 

router.post("/", verifyToken, async (req, res, next) => {

    try {

      const { concertId, quantity } =
        req.body

      // check required fields
      if (!concertId || !quantity) {

        return res.status(400).json({errorMessage: "Concert and quantity are required."
        })
      }

      const concert = await Concert.findById(concertId)

      if (!concert) {

        return res.status(404).json({errorMessage: "Concert not found."})
      }

if (concert.status !== "upcoming") {

        return res.status(400).json({errorMessage: `Cannot book tickets for a ${concert.status} concert`
        })
      }

if (concert.availableSeats < quantity) {

    return res.status(400).json({errorMessage:`Only ${concert.availableSeats} seat(s) remaining`
        })
      }


      const existing = await Booking.findOne({

          user: req.payload._id,

          concert: concertId,

          status: "confirmed"
        })

      if (existing) {

    return res.status(400).json({errorMessage: "You already have a confirmed booking for this concert."
        })
      }

      const booking = await Booking.create({

          user: req.payload._id,

          concert: concertId,

          quantity: quantity,

          totalPrice:
            concert.price * quantity
        })


      concert.availableSeats -= quantity

      if (concert.availableSeats === 0) {
        concert.status = "sold_out"
      }

      await concert.save()

      // populate booking info
      const populatedBooking = await booking.populate({
            path: "concert",
            populate: {
            path: "venue",
            select: "name city"
          }
        })

      // send response
      res.status(201).json(populatedBooking)

    } catch (error) {

      next(error)
    }
  }
)

//PATCH /api/bookings/:id (Private own booking or admin)

router.patch("/:id/", verifyToken, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
     return res.status(404).json({errorMessage:"Booking not found."})
    }
 
    const isOwner = booking.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({errorMessage:"Not authorized to cancel this booking."})
    }
 
    if (booking.status === "cancelled") {
      return res.status(400).json({errorMessage:"Booking is already cancelled."})
    }
 
    booking.status       = "cancelled";
    booking.cancelledAt  = new Date();
    booking.cancelReason = req.body.reason || "";
    await booking.save();
 
    // Restore seats to the event
    await Concert.findByIdAndUpdate(booking.concert, {
      $inc: { availableSeats: booking.quantity },
    });
 
    res.json({ message: "Booking cancelled successfully", booking });
  } catch (error) {
    next(error);
  }
});

// GET /api/bookings  (Admin)

router.get("/", verifyToken, verifyAdmin, async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate("user",  "name email")
      .populate("event", "title date")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    next(error);
  }
});

//GET /api/bookings/mybookings (Private)

router.get("/mybookings", verifyToken, async (req, res, next) => {

  try {

    const myBookings = await Booking.find({
      user: req.payload._id
    })

    res.json(myBookings)

  } catch (error) {

    res.status(500).json({errorMessage: "Failed to get bookings"
    })
  }
})

// GET /api/bookings/:id  (Private — own booking or admin)
router.get("/:id", verifyToken, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({ path: "concert", populate: { path: "venue", select: "name city" } })
      .populate("user", "name email");
 
    if (!booking) {
      return res.status(404).json({errorMessage:"Booking not found."})
    }
 
    const isOwner = booking.user._id.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({errorMessage:"Not authorized to view this booking."})
    }
 
    res.json(booking);
  } catch (error) {
    next(error);
  }
});



module.exports = router