const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const path = require('path')
const session = require('express-session')

const app = express()


//load routers
const userRoutes=require('./server/routes/userRoutes/userRoutes');
const adminRoutes=require('./server/routes/adminRoutes/adminRoutes');

dotenv.config({ path: 'config.env' })
const PORT = process.env.PORT || 8000

//log requests
app.use(morgan('tiny'))

const connectDB=require('./server/database/connection')
//momgodb connection
connectDB()

//parse request to bady-parser
// app.use(bodyparser.json());
app.use(express.urlencoded({ extended: false }))

//set view engine
app.set('view engine', 'ejs')

app.use(session({
    secret: process.env.sessionSecrect,
    resave: false,
    saveUninitialized: true
}))

//load assets
app.use('/css', express.static(path.resolve(__dirname, 'assets/css')))
app.use('/img', express.static(path.resolve(__dirname, 'assets/img')))
app.use('/js', express.static(path.resolve(__dirname, 'assets/js')))
app.use("/uploads" ,express.static(path.resolve(__dirname, "assets/uploads")))

app.use((req, res, next) => {                
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); 
    res.setHeader("Pragma", "no-cache"); 
    res.setHeader("Expires", "0"); 
    next()
})


app.use('/', userRoutes);
app.use('/', adminRoutes);

app.listen(PORT, () => { console.log(`Server is running on http://localhost:${PORT}`) })