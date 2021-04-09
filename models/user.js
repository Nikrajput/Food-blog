const mongoose=require('mongoose')
const passportLocalMongoose=require('passport-local-mongoose')
const Post=require('./post')
const Comment=require('./comment')

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
    },
    email:{
        type:String,
        required:true
    }
})

userSchema.plugin(passportLocalMongoose)

module.exports=mongoose.model('User',userSchema)