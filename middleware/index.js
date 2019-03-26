

var Stadium = require("../models/stadium");
var Comment = require("../models/comment");
var Review = require("../models/review");


var middlewareObj = {};

middlewareObj.checkCommentOwnership= function(req,res,next){
    if(req.isAuthenticated()){
   
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err || !foundComment){
                req.flas("error", "Comment not found.");
                res.redirect("back");
            }
            else{
                 
                if(foundComment.author.id.equals(req.user._id)){
                 next();
                }else{
                req.flash("error", "You don't have permission to do that.");
                 res.redirect("back");
                }
            
            }  
        });
    
    }else{
        req.flash("error", "You need to be logged in to do that.");
        res.redirect("back");
    }
};

middlewareObj.checkStadiumOwnership= function(req,res,next){
    if(req.isAuthenticated()){
    
        Stadium.findById(req.params.id, function(err, foundStadium){
            if(err || !foundStadium){
                req.flash("error", "Stadium not found.");
                res.redirect("back");
            }
            else{
                
                if(foundStadium.author.id.equals(req.user._id)){
                     next();
                }else{
                    req.flash("error", "You don't have permission to do that.");
                    res.redirect("/stadiums/"+ req.params.id);
                }
            
            }  
        });
    
    }else{
        req.flash("error", "You need to be logged in to do that.");
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = function(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You must be logged in to do that.");
    res.redirect("/login");
};


middlewareObj.checkReviewOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        Review.findById(req.params.review_id, function(err, foundReview){
            if(err || !foundReview){
                res.redirect("back");
            }  else {
                
                if(foundReview.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.checkReviewExistence = function (req, res, next) {
    if (req.isAuthenticated()) {
        Stadium.findById(req.params.id).populate("reviews").exec(function (err, foundStadium) {
            if (err || !foundStadium) {
                req.flash("error", "Stadium not found.");
                res.redirect("back");
            } else {
                
                var foundUserReview = foundStadium.reviews.some(function (review) {
                    return review.author.id.equals(req.user._id);
                });
                if (foundUserReview) {
                    req.flash("error", "You already wrote a review.");
                    return res.redirect("/stadiums/" + foundStadium._id);
                }
                
                next();
            }
        });
    } else {
        req.flash("error", "You need to login first.");
        res.redirect("back");
    }
};





    


module.exports= middlewareObj;