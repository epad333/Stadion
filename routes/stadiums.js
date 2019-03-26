var express= require("express");
var router= express.Router();

//import the models
var Stadium = require("../models/stadium");
var Comment = require("../models/comment");
var Review = require("../models/review");

var middleware = require("../middleware"); 
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);


//Multer/cloudinary
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'epad333', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


//INDEX ROUTE:
router.get("/", function(req,res){
        
        Stadium.find({}, function(err, allStadiums){
            if(err){
                console.log(err);
                
            }else{
                res.render("stadiums/index", {stadiums: allStadiums, page: "stadiums"});

            }
        });
        
      
});

//CREATE 
router.post("/", upload.single("image"), middleware.isLoggedIn, function(req, res){
  
  var name = req.body.name;
  
  var desc = req.body.description;
  
  var price= req.body.price;
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    cloudinary.uploader.upload(req.file.path, function(result) {
        var image = result.secure_url; 
        var author = {
        id: req.user._id,
        username: req.user.username
        }
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;
        var newStadium = {name: name,price: price, image: image, description: desc, author:author, location: location, lat: lat, lng: lng};
      
        Stadium.create(newStadium, function(err, newlyCreated){
            if (err) {
            req.flash('error', err.message);
            return res.redirect('back');
            }
            res.redirect('/stadiums/' + newlyCreated.id);
        });
    });
  });
});



//NEW
router.get("/new", middleware.isLoggedIn, function(req,res){
   res.render("stadiums/new"); 
});




// SHOW 
router.get("/:id", function (req, res) {
   
    Stadium.findById(req.params.id).populate("comments").populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec(function (err, foundStadium) {
        if (err) {
            req.flash("error", "Could not find that Stadium");
            res.redirect("/stadiums");
            console.log(err);
        } else {
           
            res.render("stadiums/show", {stadium: foundStadium});
        }
    });
});

//EDIT 
router.get("/:id/edit", middleware.isLoggedIn,  middleware.checkStadiumOwnership, function(req,res){
    
       
        Stadium.findById(req.params.id, function(err, foundStadium){
                 res.render("stadiums/edit", {stadium: foundStadium}); 
               
        });
 
});




// UPDATE
router.put("/:id", middleware.checkStadiumOwnership, function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
        console.log(err);
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.stadium.lat = data[0].latitude;
    req.body.stadium.lng = data[0].longitude;
    req.body.stadium.location = data[0].formattedAddress;

    Stadium.findByIdAndUpdate(req.params.id, req.body.stadium, function(err, stadium){
        if(err){
            req.flash("error", err.message);
            res.redirect("/");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/stadiums/" + stadium._id);
        }
    });
  });
});

// DESTROY
router.delete("/:id", middleware.checkStadiumOwnership, function (req, res) {
    Stadium.findById(req.params.id, function (err, stadium) {
        if (err) {
            res.redirect("/stadiums");
        } else {
           
            Comment.remove({"_id": {$in: stadium.comments}}, function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/stadiums");
                }
              
                Review.remove({"_id": {$in: stadium.reviews}}, function (err) {
                    if (err) {
                        console.log(err);
                        return res.redirect("/stadiums");
                    }
                    
                    stadium.remove();
                    req.flash("success", "Stadium deleted successfully.");
                    res.redirect("/stadiums");
                });
            });
        }
    });
});








module.exports = router;