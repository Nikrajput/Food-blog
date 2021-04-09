if (process.env.NODE_ENV != 'production') {
    require('dotenv').config({path:'./.env'})
}

const express=require('express')
const app=express()
const bodyParser=require('body-parser')
const methodOverride=require('method-override')
const expressSession=require('express-session')
const LocalStrategy = require('passport-local').Strategy

const indexRouter=require('./routes/index')
const postRouter=require('./routes/post')
const commentRouter=require('./routes/comment')
const User=require('./models/user')


app.set('view engine','ejs')
app.set('views',__dirname + '/views')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({limit:'10mb',extended:false}))
app.use(methodOverride('_method'))

const mongoose=require('mongoose')
const passport = require('passport')
mongoose.connect(process.env.DATABASE_URL,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true
})


app.use(expressSession({
    resave:false,
    saveUninitialized:false,
    secret:'24lkljdkjhd789jnjkfnjknf2'
}))

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())
passport.use(new LocalStrategy(User.authenticate()))

app.use(function(req, res, next){
   res.locals.currentUser = req.user
   next()
})

app.use('/',indexRouter)
app.use('/post',postRouter)
app.use('/post/:id/comment',commentRouter)

app.listen(process.env.PORT || 4000)
