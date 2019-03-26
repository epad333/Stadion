require('dotenv').config();


var express        = require("express"), 
    app            = express(),           
    bodyParser     = require("body-parser"), 
    mongoose       = require("mongoose"),    
    passport       = require("passport"),  
    flash          = require("connect-flash"), 
    LocalStrategy  = require("passport-local"), 
    methodOverride = require("method-override"),
    Stadium     = require ("./models/stadium"), 
    User           = require("./models/user"),      
    Comment        = require("./models/comment");   
    


  
var commentRoutes    = require("./routes/comments"), 
    stadiumRoutes = require("./routes/stadiums"),
    indexRoutes       = require("./routes/index"),
    reviewRoutes     = require("./routes/reviews");
    

mongoose.connect(""+ process.env.DATABASE_URL, { useNewUrlParser: true });
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname+"/public"))
app.use(methodOverride("_method"));
app.use(flash()); 
app.locals.moment= require("moment");

//PASSPORT CONFIGURATION------------------------------------
app.use(require("express-session")({
    secret: "ooooh soooo secret", 
    resave: false, 
    saveUninitialized: false  
}));
app.use(passport.initialize()); 
app.use(passport.session());   
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser()); 




app.use(function(req,res, next){
    res.locals.currentUser = req.user;  
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next(); 
});




app.use(indexRoutes);
app.use("/stadiums/:id/comments",commentRoutes);
app.use("/stadiums", stadiumRoutes);
app.use("/stadiums/:id/reviews", reviewRoutes);


app.get('*', function(req, res){
  res.render("404")
});





app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The Stadion Server has started");
});