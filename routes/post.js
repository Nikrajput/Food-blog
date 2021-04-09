const express=require('express')
const router=express.Router()
const middlewareObj=require('../middleware/index')
const Post=require('../models/post')
const upload=require('../utils/multer')
const cloudinary=require('../utils/cloudinary')

router.get('/',async(req,res)=>{

    let query=Post.find()
    if(req.query.name!=null && req.query.name!=''){
        query=query.regex('name',new RegExp(req.query.name,'i'))
    }

    const posts=await query.exec()
    res.render('post/index',{posts:posts})
})

router.get('/new',middlewareObj.isLoggedIn,(req,res)=>{
    res.render('post/new')
})


router.post('/new',middlewareObj.isLoggedIn,upload.single("image"),async(req,res)=>{
    
    try{
        const result=await cloudinary.uploader.upload(req.file.path)

        const post=new Post({
            name:req.body.name,
            price:req.body.price,
            description:req.body.description,
            image:result.secure_url,
            cloudinary_id:result.public_id,
            author:{
                id:req.user._id,
                username:req.user.username
            }
        })
        await post.save()
        res.redirect('/post')
    }
    catch{
        res.redirect('post//new')
    }
})

router.get('/:id',async(req,res)=>{
    
    const post=await Post.findById(req.params.id).populate('comments').exec()
    if(post==null){
        return res.redirect('/post')
    }
    res.render('post/show',{post:post})
})

router.delete('/:id',middlewareObj.isLoggedIn,async(req,res)=>{
    
    const post=await Post.findById(req.params.id)
    if(post==null){
        return res.redirect('/post')
    }
    await cloudinary.uploader.destroy(post.cloudinary_id)
    await post.remove()
    res.redirect('/post')
})

router.get('/:id/edit',middlewareObj.isLoggedIn,async(req,res)=>{

    const post=await Post.findById(req.params.id)
    if(post==null){
        res.redirect('/post')
    }
    res.render('post/edit',{post:post})
})

router.put('/:id',middlewareObj.isLoggedIn,upload.single("image"),async(req,res)=>{
    
    try{

        let post=await Post.findById(req.params.id)
        post.name=req.body.name
        post.description=req.body.description
        post.price=req.body.price

        if(req.file!=undefined){
            await cloudinary.uploader.destroy(post.cloudinary_id)
            const result=await cloudinary.uploader.upload(req.file.path)
            post.image=result.secure_url || post.image
            post.cloudinary_id=result.public_id || post.cloudinary_id
        }
        await post.save()
        res.redirect(`/post/${req.params.id}`)
    }
    catch{
        res.redirect(`/post/${req.params.id}/edit`)
    }
})

module.exports=router
