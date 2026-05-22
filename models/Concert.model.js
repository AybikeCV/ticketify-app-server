const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");

const concertSchema = new Schema

    (
        {
            title: {
                type: String,
                required: [true, "Title is required."],
                trim: true,
                minlength: [2, "Title must be at least 2 characters."],
                maxlength: [150, "Title cannot exceed 150 characters."],
            },
            artist: {
                type: String,
                required: [true, "Artist name is required."],
                trim: true,
                maxlength: [100, "Artist name cannot exceed 100 characters."],
            },
            description: {
                type: String,
                required: [true, "Description is required."],
                trim: true,
                minlength: [10, "Description must be at least 10 characters."],
                maxlength: [2000, "Description cannot exceed 2000 characters."],
            },
            venue: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Venue",
                required: [true, "Venue is required."],
            },
            date: {
                type: Date,
                required: [true, "Event date is required."],
                validate: {
                    validator: function (value) {

                        return this.isNew ? value > new Date() : true;
                        // Only enforce future date on new documents
                        /*if (this.isNew) {
  return value > new Date();
} else {
  return true;
}*/
                    },
                    message: "Event date must be in the future.",
                },
            },
            doorsOpen: {
                type: String, // "00:00"
                trim: true,
                default: "",
            },
            genre: {
                type: String,
                required: [true, "Genre is required."],
                enum: {
                    values: [
                        "ambient",
                        "pop",
                        "rock",
                        "hiphop",
                        "electronic",
                        "jazz",
                        "classical",
                        "rnb",
                        "metal",
                        "indie",
                        "alternative",
                        "psychedelic",
                        "other",
                    ],
                    message: "Invalid genre value.",
                },
            },
            price: {
                type: Number,
                required: [true, "Price is required."],
                min: [0, "Price cannot be negative."],
            },
            totalSeats: {
                type: Number,
                required: [true, "Total seats is required."],
                min: [1, "There must be at least 1 seat."],
            },
            availableSeats: {
                type: Number,
                min: [0, "Available seats cannot be negative."],
            },
            image: {
                type: String,
                default: "",
            },
            imagePublicId: {
                type: String, // Cloudinary public_id
                default: "",
            },
            status: {
                type: String,
                enum: {
                    values: ["upcoming", "cancelled", "sold_out", "past"],
                    message: "Invalid status value",
                },
                default: "upcoming",
            },
            featured: {
                type: Boolean,
                default: false,
            },
            createdBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        },
        {
            timestamps: true,
        }
    );


const Concert = model("Concert", concertSchema);

module.exports = Concert