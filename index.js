const express = require("express")
const passport = require("passport")
const session  = require("express-session")
const path = require("path")
const mongoose = require("mongoose")
const twilio = require("twilio")
require("./auth.js")
const app = express()

app.use(express.json())
app.use(express.static(path.join(__dirname, 'client')))

function isLoggedIn(req, res, next){
  req.user ? next() : res.sendStatus(401);
}

// Twilio configuration
// const twilioClient = twilio('<your_twilio_account_sid>', '<your_twilio_auth_token>');
// console.log(process.env.twilio_account_sid, process.env.twilio_auth_token);
const twilioClient = twilio(process.env.twilio_account_sid, process.env.twilio_auth_token);

app.get('/', (req, res) => {
  res.sendFile('index.html')
});

// Create Database connection
const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGO, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Database connected");
    } catch (error) {
        console.log(error)
    }
};

app.use(session({
  secret : 'mysecret',
  resave : true,
  saveUninitialized : true,
  cookie : { secure : false}
}))

app.use(passport.initialize());
app.use(passport.session());
app.get('/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { 
    successRedirect: '/auth/protected',
    failureRedirect: '/auth/google/failure' 
  }),
);

app.get('/auth/protected', isLoggedIn, (req, res) => {
  res.send("Hello there!")
})

app.get('/auth/google/failure', isLoggedIn, (req, res) => {
  res.send("something went wrong")
})


app.post('/signup', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    // Generate an OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000);

    // Save the OTP code in the user's session (e.g., using a session middleware)

    // Send the OTP code via SMS
    twilioClient.messages
      .create({
        body: `Your OTP code: ${otpCode}`,
        from: '+18882929975',
        to: phoneNumber,
      })
      .then((message) => {
        console.log('OTP sent:', message.sid);
        res.json({ message: 'OTP sent successfully' });
      })
      .catch((error) => {
        console.error('Error sending OTP:', error);
        res.status(500).json({ message: 'Something went wrong' });
      });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});



app.listen(3000, () => {
  dbConnect();
  console.log('Listening on port 3000')
})
