var express = require("express");
var router = express.Router({mergeParams: true});
var Stadium = require("../models/stadium");
var Review = require("../models/review");
var middleware = require("../middleware");

// Reviews Index
router.get("/", function (req, res) {
    Stadium.findById(req.params.id).populate({
        path: "reviews",
        options: {sort: {createdAt: -1}} 
    }).exec(function (err, stadium) {
        if (err || !stadium) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/index", {stadium: stadium});
    });
});


router.get("/new", middleware.isLoggedIn, middleware.checkReviewExistence, function (req, res) {
  
    Stadium.findById(req.params.id, function (err, stadium) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/new", {stadium: stadium});

    });
});


router.post("/", middleware.isLoggedIn, middleware.checkReviewExistence, function (req, res) {
  
    Stadium.findById(req.params.id).populate("reviews").exec(function (err, stadium) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Review.create(req.body.review, function (err, review) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            
            review.author.id = req.user._id;
            review.author.username = req.user.username;
            review.stadium = stadium;
            
            review.save();
            stadium.reviews.push(review);
          
            stadium.rating = calculateAverage(stadium.reviews);
           
            stadium.save();
            req.flash("success", "Your review has been successfully added.");
            res.redirect('/stadiums/' + stadium._id);
        });
    });
});


router.get("/:review_id/edit", middleware.checkReviewOwnership, function (req, res) {
    Review.findById(req.params.review_id, function (err, foundReview) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/edit", {stadium_id: req.params.id, review: foundReview});
    });
});


router.put("/:review_id", middleware.checkReviewOwnership, function (req, res) {
    Review.findByIdAndUpdate(req.params.review_id, req.body.review, {new: true}, function (err, updatedReview) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Stadium.findById(req.params.id).populate("reviews").exec(function (err, stadium) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            
            stadium.rating = calculateAverage(stadium.reviews);
            
            stadium.save();
            req.flash("success", "Your review was successfully edited.");
            res.redirect('/stadiums/' + stadium._id);
        });
    });
});


router.delete("/:review_id", middleware.checkReviewOwnership, function (req, res) {
    Review.findByIdAndRemove(req.params.review_id, function (err) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Stadium.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.review_id}}, {new: true}).populate("reviews").exec(function (err, stadium) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
           
            stadium.rating = calculateAverage(stadium.reviews);
            
            stadium.save();
            req.flash("success", "Your review was deleted successfully.");
            res.redirect("/stadiums/" + req.params.id);
        });
    });
});

function calculateAverage(reviews) {
    if (reviews.length === 0) {
        return 0;
    }
    var sum = 0;
    reviews.forEach(function (element) {
        sum += element.rating;
    });
    return sum / reviews.length;
}

module.exports = router;