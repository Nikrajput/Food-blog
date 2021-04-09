const express=require('express')
const router=express.Router({ mergeParams: true })
const Post=require('../models/post')
const Comment=require('../models/comment')
const middleware=require('../middleware/index')
const moment=require('moment')

router.get('/new',middleware.isLoggedIn,async(req,res)=>{
    const post=await Post.findById(req.params.id)
    if(post==null){
        const posts=await Post.find()
        return res.render('post/index',{posts:posts,errorMessage:'Post no longer exists'})
    }
    res.render('comment/new',{post:post,errorMessage:''})
})

router.post('/new',middleware.isLoggedIn,async(req,res)=>{
    const post=await Post.findById(req.params.id)
    if(post==null){
        const posts=await Post.find()
        return res.render('post/index',{posts:posts,errorMessage:'Post no longer exists'})
    }

    const comment=new Comment({
        text:req.body.text,
        author:{
            id:req.user._id,
            username:req.user.username,
            dateAdded:moment(Date.now()).format("DD/MM/YYYY")
        }
    })
    await comment.save()
    post.comments.push(comment.id)
    await post.save()
    console.log(post.comments)
    res.redirect(`/post/${req.params.id}`)
})

router.delete('/:c_id',async(req,res)=>{
    
    const comment=await Comment.findById(req.params.c_id)
    if(comment==null){
        const post=await Post.findById(req.params.id)
        if(post==null){
            const posts=await Post.find()
            return res.render('post/index',{posts:posts,errorMessage:'Post no longer exists'})
        }
        return res.render(`post/show`,{post:post,errorMessage:'Comment no longer exists'})
    }

    await comment.remove()
    res.redirect(`/post/${req.params.id}`)
})

router.get('/:c_id/edit',async(req,res)=>{

    const post=await Post.findById(req.params.id)
    if(post==null){
        const posts=await Post.find()
        return res.render('post/index',{posts:posts,errorMessage:'Post no longer exists'})
    }
    const comment=await Comment.findById(req.params.c_id)
    if(comment==null){
        return res.render(`post/show`,{post:post,errorMessage:'Comment no longer exists'})
    }
    res.render('comment/edit',{post:post,comment:comment,errorMessage:''})
})

router.put('/:c_id',async(req,res)=>{
    
    try{

        let comment=await Comment.findById(req.params.c_id)
        comment.text=req.body.text
        await comment.save()
        
        res.redirect(`/post/${req.params.id}`)
    }
    catch{
        res.render('comment/edit',{post:post,comment:comment,errorMessage:''})
    }
})

module.exports=router