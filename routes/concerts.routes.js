const express = require("express")
const router = express.Router()
const cloudinary = require ("../middlewares/cloudinary.config")
const Concert = require("../models/Concert.model")
const Booking = require("../models/Booking.model")
const { verifyToken, verifyAdmin } = require("../middlewares/auth.middlewares")

//POST /api/concerts (Admin) create a concert

router.post("/", verifyToken, verifyAdmin, async (req, res, next) => {

    try {

      const title = req.body.title
      const artist = req.body.artist
      const description = req.body.description
      const venue = req.body.venue
      const date = req.body.date
      const doorsOpen = req.body.doorsOpen
      const genre = req.body.genre
      const price = req.body.price
      const totalSeats = req.body.totalSeats
      const availableSeats = req.body.availableSeats
      const image = req.body.image
      const imagePublicId = req.body.imagePublicId
      const status = req.body.status
      const featured = req.body.featured

      const concert = await Concert.create({

        title: title,

        artist: artist,

        description: description,

        venue: venue,

        date: date,

        doorsOpen: doorsOpen,

        genre: genre,

        price: price,

        totalSeats: totalSeats,

        availableSeats:
          availableSeats || totalSeats,

        image: image || "",

        imagePublicId:
          imagePublicId || "",

        status: status || "upcoming",

        featured: featured || false,

        createdBy: req.payload._id
      })

      // populate venue info
      const populatedConcert =
        await concert.populate(
          "venue",
          "name city address"
        )

      // send response
      res.status(201).json(populatedConcert)

    } catch (error) {

      res.status(500).json({errorMessage: "Failed to create concert."
      })
    }
  }
)


//PATCH api/concerts/:id (Admin) update a concert

router.patch("/:id", verifyToken, verifyAdmin, async (req, res, next) => {
  try {
    const concert = await Concert.findById(req.params.id);
    if (!concert) {
      res.status(404).json({errorMessage: "Concert not found."})
    }
 
    const { title, artist, description, venue, date, doorsOpen, genre, price, totalSeats, image, imagePublicId, status, featured } = req.body;
 
    // Delete old Cloudinary image only when a new one is being set
    if (image && image !== concert.image && concert.imagePublicId) {
      await cloudinary.uploader.destroy(concert.imagePublicId);
    }
 
    if (title)                        concert.title        = title;
    if (artist)                       concert.artist       = artist;
    if (description)                  concert.description  = description;
    if (venue)                        concert.venue        = venue;
    if (date)                         concert.date         = date;
    if (doorsOpen !== undefined)      concert.doorsOpen    = doorsOpen;
    if (genre)                        concert.genre        = genre;
    if (price !== undefined)          concert.price        = price;
    if (totalSeats !== undefined)     concert.totalSeats   = totalSeats;
    if (image)                        concert.image        = image;
    if (imagePublicId !== undefined)  concert.imagePublicId = imagePublicId;
    if (status)                       concert.status       = status;
    if (featured !== undefined)       concert.featured     = featured;
 
    const updatedConcert = await concert.save({ runValidators: true });
    const populatedConcert = await updatedConcert.populate("venue", "name city");
    res.json(populatedConcert);
  } catch (error) {
    next(error);
  }
});

//DELETE api/concerts/:id (Admin) delete a concert

router.delete("/:id", verifyToken, verifyAdmin, async (req, res, next) => {
  try {
    const concert = await Concert.findById(req.params.id);
    if (!concert) {
      res.status(404).json({errorMessage: "Concert not found."})
    }
 
    const confirmedBookings = await Booking.countDocuments({ event: concert._id, status: "confirmed" });
    if (confirmedBookings > 0) {
      res.status(400).json({errorMessage: `Cannot delete the concert with ${confirmedBookings} confirmed booking(s). Cancel it instead.`})
    }
 
    if (concert.imagePublicId) await cloudinary.uploader.destroy(concert.imagePublicId);
 
    await concert.deleteOne();
    res.json({ message: "Concert removed successfully" });
  } catch (error) {
    next(error);
  }
});

//GET /api/concerts Public

router.get("/", async (req, res, next) => {
  try {
    const { search, genre } = req.query;
 
    const filteredConcert = { status: { $ne: "past" } };  //notEqual not past concerts
 
    if (genre) filteredConcert.genre = genre;
 
    if (search) {
      filteredConcert.$or = [  //match any of these conditions match title or match artist
        { title:  { $regex: search, $options: "i" } }, // $regex search for partial $options case-insensitive
        { artist: { $regex: search, $options: "i" } },
      ];
    }
 
    const concerts = await Concert.find(filteredConcert)
      .populate("venue", "name city address location")
      .sort({ date: 1 });
 
    res.json(concerts);
  } catch (error) {
    next(error);
  }
});

//GET /api/concerts/featured Public 
router.get("/featured", async (req, res, next) => {
  try {
    const concerts = await Concert.find({ featured: true, status: "upcoming" })
      .populate("venue", "name city")
      .sort({ date: 1 })
      .limit(6);
    res.json(concerts);
  } catch (error) {
    next(error);
  }
});

// GET /api/concerts/:id  (Public)

router.get("/:id", async (req, res, next) => {
  try {
    const concert = await Concert.findById(req.params.id).populate("venue", "name city address location capacity");
    if (!concert) {
      res.status(404).json({errorMessage: "Concert not found."})
    }
    res.json(concert);
  } catch (error) {
    next(error);
  }
});



module.exports = router