const express=require('express')
const router=express.Router({ mergeParams: true })
const Post=require('../models/post')
const Comment=require('../models/comment')
const middleware=require('../middleware/index')
const moment=require('moment')

router.get('/new',middleware.isLoggedIn,async(req,res)=>{
    const post=await Post.findById(req.params.id)
    if(post==null){
        res.redirect('/post')
    }
    res.render('comment/new',{post:post})
})

router.post('/new',middleware.isLoggedIn,async(req,res)=>{
    const post=await Post.findById(req.params.id)
    if(post==null){
        res.redirect('/post')
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
        return res.redirect(`/post/${req.params.id}`)
    }

    await comment.remove()
    res.redirect(`/post/${req.params.id}`)

})

router.get('/:c_id/edit',async(req,res)=>{

    const post=await Post.findById(req.params.id)
    if(post==null){
        res.redirect('/post')
    }
    const comment=await Comment.findById(req.params.c_id)
    if(comment==null){
        return res.redirect(`/post/${req.params.id}`)
    }
    res.render('comment/edit',{post:post,comment:comment})
})

router.put('/:c_id',async(req,res)=>{
    
    try{

        let comment=await Comment.findById(req.params.c_id)
        comment.text=req.body.text
        await comment.save()
        
        res.redirect(`/post/${req.params.id}`)
    }
    catch{
        res.redirect(`/post/${req.params.id}/comment/${req.params.c_id}/edit`)
    }
})

module.exports=router