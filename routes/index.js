var express = require("express");
var router = express.Router();
var User = require("../models/user");
var passport= require("passport");

router.get("/", function(req,res){
    res.render("landing");
});



//AUTHENTICATION ROUTES   =========================================================

//show register form
router.get("/register", function(req,res){
    res.render("register", {page: "register"});
});

router.post("/register", function(req,res){
   //User.register is provided by the passport-local-mongoose package
   var newUser = new User({username: req.body.username});
   User.register(newUser, req.body.password, function(err, user){
       if(err){
           console.log(err);
           req.flash("error", err.message);
           return res.redirect("register");
       }
       passport.authenticate("local")(req, res, function(){
           req.flash("success", "You have succesfully signed up! Welcome "+ user.username);
           res.redirect("/stadiums");
       });
   });
   
   
});

router.get("/login", function(req, res){
   res.render("login", {page: "login"}); 
});


router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/stadiums", 
        failureRedirect: "/login",
        failureFlash:true
    }), function(req,res){
   
});

//logout route
router.get("/logout", function(req,res){
    req.logout();
    req.flash("success", "Logged you out.");
    res.redirect("/stadiums");
});





module.exports = router;