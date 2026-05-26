const express = require("express")
const router = express.Router()
const User = require("../models/User.model")
const cloudinary = require("../middlewares/cloudinary.config")
const { verifyToken, verifyAdmin } = require("../middlewares/auth.middlewares")
const bcrypt = require("bcryptjs")

//GET /api/users/profile (Private) profile info of a user

router.get("/profile", verifyToken, async (req, res, next) => {
    try {
        const user = await User.findById(req.payload._id)
        console.log(user)
        res.status(200).json(user)

    } catch (error) {
        next(error)
    }
})

//PATCH /api/users/profile (Private)

router.patch("/profile", verifyToken, async (req, res, next) => {
    try {
        const user = await User.findById(req.payload._id);
        if (!user) {
            res.status(401).json({ errorMessage: "User not found." })
        }

        const { name, email, password, avatar, avatarPublicId } = req.body;

        if (name) user.name = name;
        if (email) user.email = email;

        if (password) {
            if (password.length < 6) {
                res.status(400);
                throw new Error("Password must be at least 6 characters");
            }
            const hashedPassword = await bcrypt.hash(password, 12)  //hashing password also after update
            user.password = hashedPassword;
        }

        // If a new avatar was uploaded, delete the old one from Cloudinary first
        if (avatar && avatar !== user.avatar) {
            if (user.avatarPublicId) {
                await cloudinary.uploader.destroy(user.avatarPublicId);
            }
            user.avatar = avatar;
            user.avatarPublicId = avatarPublicId || "";
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            avatar: updatedUser.avatar,
            role: updatedUser.role
        });
    } catch (error) {
        next(error);
    }


})

//DELETE /api/users/profile (Private)

router.delete("/profile", verifyToken, async (req, res, next) => {
    try {

      const user = await User.findById(req.payload._id)

      if (!user) {
        return res.status(404).json({
          errorMessage: "User not found."
        })
      }

      // delete avatar from cloudinary
      if (user.avatarPublicId) {
        await cloudinary.uploader.destroy(
          user.avatarPublicId
        )
      }

      await user.deleteOne()

      res.status(200).json({
        message: "Your account is deleted successfully."
      })

    } catch (error) {
      next(error)
    }
})

//GET /api/users (Admin)

router.get("/", verifyToken, verifyAdmin, async (req, res) => {

    try {

        const users = await User.find().select("name email role avatar isActive createdAt")
        console.log(users)

        if (users.length === 0) {
            res.status(204).json(users)
        } else {
            res.status(200).json(users)
        }


    } catch (error) {
        console.log(error)
    }

})

//GET /api/users/:id get a single user (Admin)  //use paramsto call the user not the payload._id which is personal

router.get("/:id", verifyToken, verifyAdmin, async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select("name email role avatar createdAt");
        if (!user) {
            res.status(400).json({ errorMessage: "User not found." });
        }
        res.json(user);
    } catch (error) {
        next(error);
    }
});

//PATCH /api/users/:id (Admin) // only change the role and active mode of the user

router.patch("/:id", verifyToken, verifyAdmin, async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(401).json({ errorMessage: "User not found." })
        }

        if (
  user.role === "admin" &&
  user._id.toString() !== req.payload._id
) {
  return res.status(403).json({
    errorMessage:
      "Admins cannot modify other admins."
  });
}


        const { role, isActive } = req.body;

        if (role) user.role = role
if (typeof isActive === "boolean") user.isActive = isActive

        const updated = await user.save();
        res.json({
            _id: updated._id,
            name: updated.name,
            email: updated.email,
            role: updated.role,

        });
    } catch (error) {
        next(error);
    }
});

//DELETE /api/users/:id (Admin) 

router.delete("/:id", verifyToken, verifyAdmin, async (req, res, next) => {

    try {

      const user = await User.findById(req.params.id)

      if (!user) {
        return res.status(404).json({
          errorMessage: "User not found."
        })
      }

      // prevent admin deleting themselves
      if (
        user._id.toString() ===
        req.payload._id.toString()
      ) {
        return res.status(400).json({errorMessage: "You cannot delete your own admin account."
        })
      }

      // prevent deleting other admins
      if (user.role === "admin") {
        return res.status(403).json({errorMessage: "Admins cannot be deleted."
        })
      }

      // delete cloudinary avatar
      if (user.avatarPublicId) {
        await cloudinary.uploader.destroy(user.avatarPublicId)
      }

      await user.deleteOne()

      res.status(200).json({errorMessage: "User deleted successfully."
      })

    } catch (error) {
      next(error)
    }
  }
)



module.exports = router




