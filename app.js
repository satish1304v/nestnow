if(process.env.NODE_ENV != "production"){
    require('dotenv').config()
}
const express = require("express");
const app = express();

const path = require("path");
app.set("view engine" ,"ejs");
app.set("views" , path.join(__dirname, "views"));
app.use(express.urlencoded({extended : true}));
const methodOverride = require("method-override");
app.use(methodOverride("_method"));

const ejsMate  = require("ejs-mate");
app.engine('ejs', ejsMate); 

app.use(express.static(path.join(__dirname , "/public"))); 

const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js")

const Review = require("./models/review.js"); // requiring 


const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js"); // requiring 

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


const mongoose = require("mongoose"); 


// const MONGO_URL = "mongodb://127.0.0.1:27017/nestnow";
const dbUrl = process.env.ATLASDB_URL;

main().then(() => {
    console.log("connected to DB");
}).catch(err => {
    console.log(err);
});
async function main() {
    await mongoose.connect(dbUrl);
}

//session
const store = MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter: 24*3600,
})

store.on("error", () =>{
    console.log("ERROR in MONGO SESSION STORE",err);
})


const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false, 
    saveUninitialized: true,
    cookie: {               
        expires: Date.now() + 7 * 24 * 60 * 60 *1000, 
        maxAge: 7 * 24 * 60 * 60 *1000,
        httpOnly: true,
    },          
};




// app.get("/", (req, res) => {
//     res.send("Hi, i am root");
// })

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
    res.locals.success = req.flash("success"); 
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
})

app.use((err, req, res, next) => {
    let {statusCode=500, message="Something went wrong"} = err;
    res.status(statusCode).render("error.ejs" ,{ message });
}); 


app.listen(8080 , () => {
    console.log("server is listening to port 8080");
});