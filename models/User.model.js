const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");


const userSchema = new Schema(
  {

    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      minlength: [2, "Name must be at least 2 charachters."],
      maxlength: [50, "Name cannot exceed 50 characters."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email."],
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: {
        values: ["user", "admin"],
        message: "Role must be either 'user' or 'admin'",
      },
      default: "user",
    },
    avatar: {
      type: String,
      default: "",
    },
    avatarPublicId: {
      type: String, // Cloudinary public_id — needed to delete old avatar
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {

    timestamps: true  // adds extra properties: `createdAt` and `updatedAt`
  }
);

const User = model("User", userSchema)

module.exports = User;
