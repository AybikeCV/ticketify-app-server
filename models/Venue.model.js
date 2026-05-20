const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");
const Venue = model("Venue", venueSchema);

const venueSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Venue name is required."],
            trim: true,
            minlength: [2, "Name must be at least 2 characters."],
            maxlength: [100, "Name cannot exceed 100 characters."],
        },
        address: {
            type: String,
            required: [true, "Address is required."],
            trim: true,
            maxlength: [200, "Address cannot exceed 200 characters."],
        },
        city: {
            type: String,
            required: [true, "City is required."],
            trim: true,
            maxlength: [100, "City cannot exceed 100 characters."],
        },
        country: {
            type: String,
            required: [true, "Country is required."],
            trim: true,
            default: "Netherlands",
        },
       
        location: {
  type: {
    type: String,
    enum: ["Point"],
    default: "Point",
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: [true, "Coordinates are required"],
    validate: {
      validator: function (val) {
        // Must be exactly [longitude, latitude]
        // longitude: -180 to 180, latitude: -90 to 90
        return (
          val.length === 2 &&
          val[0] >= -180 && val[0] <= 180 &&
          val[1] >= -90  && val[1] <= 90
        );
      },
      message: "Coordinates must be [longitude, latitude] with valid ranges",
    },
  },
},


        capacity: {
            type: Number,
            required: [true, "Capacity is required."],
            min: [1, "Capacity must be at least 1"],
        },
        image: {
            type: String,
            default: "",
        },
        imagePublicId: {
            type: String, // Cloudinary public_id
            default: "",
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, "Description cannot exceed 500 characters."],
            default: "",
        },
    },
    {
        timestamps: true,

    }
)

module.exports = Venue