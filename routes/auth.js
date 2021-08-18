const router = require('express').Router();
const User = require('../model/User');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');

const {registerValidation, loginValidation} = require('../validation');
const saltRounds = 10;

router.post('/register', async (req, res) => {

    //VALIDATE DATA BEFORE MAKE A USER
    //const {error} = Joi.validate(req.body, schema);
    const {error} = registerValidation(req.body)    
    if(error) return res.status(400).send(error.details[0].message);

    //CHECK IF THE USER IS ALREADY IN THE DATABASE
    const emailExists = await User.findOne({email: req.body.email});
    if(emailExists) return res.status(400).send('Email already exists!');

    //HASH THE PASSWORD
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //CREATE A NEW USER
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    });
    try {
        const savedUser = await user.save();
        res.send({user: user._id});
    }catch (err){
        res.status(400).send(err);
    }
});

//LOGIN
router.post('/login',  async (req, res) => {

    //VALIDATE DATA BEFORE LOGIN
    const {error} = loginValidation(req.body)    
    if(error) return res.status(400).send(error.details[0].message);

    //CHECKING OF THE EMAIL EXISTS ON THE DATABASE

    const user = await User.findOne({email: req.body.email});
    if(!user) return res.status(400).send('Email or password not registered!');

    //PASSWORD IS CORRECT
    const validPass = await bcrypt.compare(req.body.password, user.password)
    if(!validPass) return res.status(400).send('Invalid credentials!')

    //CREATE AND ASSIGN A TOKEN
    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET);
    res.header('auth-token', token).send(token);

    //res.send('Logged In!')

})

module.exports = router;