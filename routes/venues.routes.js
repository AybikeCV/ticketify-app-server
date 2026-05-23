const router = require("express").Router();
const cloudinary = require("../middlewares/cloudinary.config");
const { verifyToken, verifyAdmin } = require("../middlewares/auth.middlewares");
const Venue = require("../models/Venue.model");
const Concert = require("../models/Concert.model");


//POST /api/venues (Admin) creates venue

router.post("/", verifyToken, verifyAdmin, async (req, res, next) => {
    try {
        const { name, address, city, country, location, capacity, description, image, imagePublicId } =
            req.body;

        if (!name || !address || !city || !location || !capacity) {
            return res.status(400).json({errorMessage: "Please provide all required fields for the venue."})
        }

        const venue = await Venue.create({
            name,
            address,
            city,
            country: country || "Netherlands",
            location,     // { type: "Point", coordinates: [lng, lat] }
            capacity,
            description: description || "",
            image: image || "",
            imagePublicId: imagePublicId || "",
        });

        res.status(201).json(venue);
    } catch (error) {
        next(error);
    }
});

//PUT /api/venues/:id (Admin) update/change venue
router.put("/:id", verifyToken, verifyAdmin, async (req, res, next) => {
    try {

        const venue = await Venue.findById(req.params.id)

        if (!venue) {
            return res.status(404).json({errorMessage: "Venue not found."})
        }

        // delete old image if new image uploaded
        if (
            req.body.image &&
            req.body.image !== venue.image
        ) {

            if (venue.imagePublicId) {
                await cloudinary.uploader.destroy(
                    venue.imagePublicId
                )
            }
        }

        const updatedVenue =
            await Venue.findByIdAndUpdate(
                req.params.id,
                { ...req.body },
                {
                    new: true,
                    runValidators: true
                }
            )

        res.json(updatedVenue)

    } catch (error) {
        next(error)
    }
})

//DELETE / api/venues/:id (Admin)

router.delete("/:id", verifyToken, verifyAdmin, async (req, res, next) => {

    try {

        const venue = await Venue.findById(req.params.id)


        if (!venue) {
            return res.status(404).json({errorMessage: "Venue not found."})
        }

        // 3. Check if venue still has upcoming events
        const upcomingCount =
            await Concert.countDocuments({
                venue: venue._id,
                status: "upcoming"
            })

        // 4. Prevent deleting active venue
        if (upcomingCount > 0) {
            return res.status(400).json({errorMessage:`Cannot delete venue with ${upcomingCount} upcoming event(s). Cancel or reassign them first.`})
        }


        if (venue.imagePublicId) {
            await cloudinary.uploader.destroy(venue.imagePublicId)
        }
        await venue.deleteOne()

        res.json({ message: "Venue removed successfully." })

    } catch (error) {
        next(error)
    }
}
)

//GET /api/venues   all venues by city and venues alphabetically (Public)

router.get("/", async (req, res, next) => {
    try {
        const venues = await Venue.find().sort({ city: 1, name: 1 });
        res.json(venues);
    } catch (error) {
        next(error);
    }
});

//GET /api/venues/:id (Public) Get one venue

router.get("/:id", async (req, res, next) => {
    try {

        const venue = await Venue.findById(req.params.id)

        if (!venue) {
            return res.status(404).json({
                errorMessage: "Venue not found."
            })
        }

        // Get upcoming events at this venue
        const upcomingConcerts = await Concert.find({
            venue: venue._id,
            status: "upcoming"
        }).sort({ date: 1 })

        res.json({ venue, upcomingConcerts })

    } catch (error) {
        next(error)
    }
})



module.exports = router