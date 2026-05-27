const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");

const bookingSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"],
        },
        concert: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Concert",
            required: [true, "Concert is required"],
        },
        seats: {
            type: [String],
            required: [true, "At least one seat must be selected"],
        },
        totalPrice: {
            type: Number,
            required: [true, "Total price is required"],
            min: [0, "Total price cannot be negative"],
        },
        status: {
            type: String,
            enum: {
                values: ["confirmed", "cancelled"],
                message: "Invalid booking status",
            },
            default: "confirmed",
        },
        cancelledAt: { type: Date, default: null },
        cancelReason: { type: String, trim: true, maxlength: [300, "Cancel reason cannot exceed 300 characters"], default: "" },
    },
    { timestamps: true }
);

bookingSchema.index({ user: 1, concert: 1 });

const Booking = model("Booking", bookingSchema);

module.exports = Booking