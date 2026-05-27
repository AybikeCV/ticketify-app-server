const router = require("express").Router()
const User = require("../models/User.model")

const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const { verifyToken } = require("../middlewares/auth.middlewares")

//POST "/api/auth/signup" => signup create the new user
router.post("/signup", async (req, res, next) => {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
        res.status(400).json({errorMessage: "Please provide a name, an email and a password"})
        return
    }
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm
    if(passwordRegex.test(password) === false) {
        res.status(400).json({errorMessage: "Password is not strong enough. It needs at least 8 characters with one uppercase, one lowercase and one number" })
    return
    }
    try {
        const foundUser = await User.findOne({email:email})
        if (foundUser) {
            res.status(400).json({errorMEssage: "User with this email is already existed"})
            return
        }
        
        const hashedPassword = await bcrypt.hash(password, 12)

        // create the new user

        const newUser = {
            name: name,
            email: email,
            password: hashedPassword
        }

        const response = await User.create(newUser)
        res.sendStatus(201)
    } catch (error) {
        next(error)
    }
})

//POST "/api/auth/login" =>  login receiving credentials from the user, authenticating them and sending the token
router.post("/login", async (req, res, next) => {

  console.log(req.body)
  const { email, password } = req.body

  
    if (!email || !password) {
    res.status(400).json({ errorMessage: "Both email and password are mandatory." })
    return 
  }

  try {
    
  
    const foundUser = await User.findOne({ email: email })
    console.log(foundUser)
    if (!foundUser) {
      res.status(400).json({errorMessage: "User with this email does not exist. Please signup first."})
      return 
    }

   
   const isPasswordMatch = await bcrypt.compare(password, foundUser.password)
    if (!isPasswordMatch) {
      res.status(400).json({errorMessage: "The password is not correct."})
      return 
    } 


    const payload = {
      _id: foundUser._id,
      email: foundUser.email,
      role: foundUser.role,
      name: foundUser.name
    }

    const tokenConfig = {
      expiresIn: "7d"
    }

    const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, tokenConfig)

    res.status(200).json({ authToken, payload })

  } catch (error) {
    next(error)
  }
})


// GET "/api/auth/verify" => Only for frontend purposes. So the frontend know who the owner of the token is.
router.get("/verify", verifyToken, (req, res) => {
 
  res.status(200).json({ payload: req.payload })
})

//GET "/me" (Private)

router.get("/me", verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.payload._id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});



module.exports = router