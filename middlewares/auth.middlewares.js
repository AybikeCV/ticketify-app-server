const jwt = require("jsonwebtoken")

function verifyToken(req, res, next) {
    try{
        console.log(req.headers)
        const authToken = req.headers.authorization.split(" ")[1]
        const payload = jwt.verify(authToken, process.env.TOKEN_SECRET)
        req.payload = payload
        next()
    } catch (error) {
        res.status(401).json({errorMessage: "Token is not provided or is not valid."})

    }
}

function verifyAdmin(req, res, next) {
    if (req.payload.role === "admin") {
        next()
    } else {
        res.status(401).json({errorMessage: "You are not an admin. This route is only for admins."})
    }
}

module.exports = {
    verifyToken,
    verifyAdmin
}