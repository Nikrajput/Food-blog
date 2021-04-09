const express=require('express')
const router=express.Router()
const passport=require('passport')
const User=require('../models/user')
const Post=require('../models/post')
const Comment=require('../models/comment')
const middleware=require('../middleware/index')
const middlewareObj = require('../middleware/index')

router.get('/',async(req,res)=>{
    res.render('landing')
})

router.get('/signup',(req,res)=>{
    res.render('user/signup')
})

router.post('/signup',(req,res)=>{
    const newUser=new User({
        username:req.body.username,
        password:req.body.password,
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        email:req.body.email
    })

    User.register(newUser,req.body.password,function(err,user){
        if(err){
            console.log(err)
            res.redirect('/signup')
        }
        else{
            passport.authenticate('local')(req, res, function() {
                res.redirect("/post")
            })
        }
    })
})

router.get('/login',(req,res)=>{
    res.render('user/login')
})

router.post('/login',passport.authenticate('local',{
    successRedirect:'/post',
    failureRedirect:'/login'
}),function(req,res){})

router.get('/logout',(req,res)=>{
    req.logout()
    res.redirect('/post')
})

router.get('/user/:id',middlewareObj.isLoggedIn,async(req,res)=>{

    const user=await User.findById(req.params.id)
    if(user==null){
        return res.redirect('/login')
    }
    const posts=await Post.find().where('author.id').equals(req.params.id).exec()
    res.render('user/show',{
        user:user,
        posts:posts,
        errorMessage:''
    })
})

router.delete('/user/:id',middleware.isLoggedIn,async(req,res)=>{
    
    const user=await User.findById(req.params.id)
    if(user==null){
        res.redirect('/login')
    }

    const posts=await Post.find().where('author.id').equals(req.params.id).exec()
    if(posts.length>0){
        return res.render('user/show',{
            user:user,
            posts:posts,
            errorMessage:"You still have some undeleted posts"
        })
    }

    const comments=await Comment.find().where('author.id').equals(req.params.id).exec()
    if(comments.length>0){
        return res.render('user/show',{
            user:user,
            posts:posts,
            errorMessage:"You still have some undeleted comments"
        })
    }
    await user.remove()
    res.redirect('/logout')
})

module.exports=router