var mongoose = require("mongoose");



var stadiumSchema = new mongoose.Schema({
    name: String, 
    price: String,
    image: String,
    description: String,
    location: String,
    lat: Number,
    lng: Number,
    createdAt: { type: Date, default: Date.now },
    comments:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    rating: {
        type: Number,
        default: 0
    },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
            
            
        }, 
        username: String
    }
});

var Stadium = mongoose.model("Stadium", stadiumSchema);

module.exports= Stadium;