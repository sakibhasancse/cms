const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const postSchema = new Schema({
    title: {
        type: String,
        required:true
        
  },
  userId: {
 type:String
  },
    image: {
        type:String
    },
    description: {
        type:String,
        required:true
    },
    
  createdOn: {
    
    type: Date,
      default:Date.now
  }
    
    
})
module.exports=mongoose.model('uploadPost',postSchema)