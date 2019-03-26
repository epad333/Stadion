var express= require("express");
var router = express.Router({mergeParams:true});
var Stadium= require("../models/stadium");
var Comment = require("../models/comment");
var middleware = require("../middleware"); 



//==================================      COMMENTS ROUTE ===========================

router.get("/new", middleware.isLoggedIn, function(req, res){
    Stadium.findById(req.params.id, function(err, foundStadium){
        if(err){
            console.log(err);
        }else{
           res.render("comments/new", {stadium: foundStadium} ); 
        }
    });
    
});

router.post("/", middleware.isLoggedIn, function(req,res){
   
    Stadium.findById(req.params.id, function(err, foundStadium){
        if(err){
            console.log(err);
        }else{
            console.log(req.body.comment);
           
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    req.flash("error", "Something went wrong.")
                    console.log(err);
                }else{
                    
                    comment.author.id= req.user._id;
                    comment.author.username= req.user.username;
                    
                    comment.save();
                    foundStadium.comments.push(comment);
                    foundStadium.save();
                    console.log(comment);
                    req.flash("success", "Succesfully added comment.")
                    res.redirect("/stadiums/"+ foundStadium._id);
                }
            });
            
        }
    });

});


router.get("/:comment_id/edit",middleware.checkCommentOwnership, function(req,res){
    var stadium_id= req.params.id;
    Stadium.findById(stadium_id, function(err, foundStadium){
        if(err || !foundStadium){
            req.flash("error", "No Stadium found" );
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                console.log(err);
                res.redirect("back");
            }else{
                res.render("comments/edit", {stadium_id: stadium_id, comment: foundComment});
            }
        });
    });

    
});

router.put("/:comment_id", middleware.checkCommentOwnership, function(req,res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            console.log(err);
            res.redirect("back");
        }else{
            res.redirect("/stadiums/"+req.params.id);
        }
    });
});


router.delete("/:comment_id", middleware.checkCommentOwnership, function(req,res){
    
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            console.log(err);
            res.redirect("back");
        }
        else{
            req.flash("success", "Comment deleted.");
            res.redirect("/stadiums/"+ req.params.id);
        }
            
    })
});


    











module.exports = router;