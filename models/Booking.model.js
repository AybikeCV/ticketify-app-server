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
        quantity: {
            type: Number,
            required: [true, "Quantity is required"],
            min: [1, "Must book at least 1 ticket"],
            max: [10, "Cannot book more than 10 tickets at once"],
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

bookingSchema.index({ user: 1, event: 1 });

const Booking = model("Booking", bookingSchema);

module.exports = Booking