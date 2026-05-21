const express = require("express")
const router = express.Router()
const cloudinary = require ("../middlewares/cloudinary.config")
const Concert = require("../models/Concert.model")


router.post("/", (req, res) => {
    console.log(req.body)

    const newConcert = {

    }
})




module.exports = router