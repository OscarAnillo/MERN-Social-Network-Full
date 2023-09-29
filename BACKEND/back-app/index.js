import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv'
import multer from 'multer';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path'
import { fileURLToPath } from 'url'  ;
import { register } from './Controllers/auth.js';
import authRoutes  from './Routes/auth.js'
import userRoutes from "./Routes/users.js"
import postRoutes from "./Routes/posts.js"
import { createPost } from './Controllers/posts.js'
import { verifyToken } from './Middleware/auth.js';
import User from "./Models/User.js"
import Post from './Models/Post.js';
import { users, posts } from './Data/index.js';

/* Configurations */
const __filename = fileURLToPath(import.meta.url); //index.js
const __dirname = path.dirname(__filename); //back-app
dotenv.config();

const app = express();

app.use(express.json());
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin"}))
app.use(morgan("common"))
app.use(bodyParser.json({ limit: "30mb", extended: true }))
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }))
app.use(cors())
app.use("/assets", express.static(path.join(__dirname, 'public/assets')))


/* FILE STORAGE */
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "public/assets")
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload =  multer({ storage });

/* ROUTES WITH FILES */
app.post("/auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost)


/* ROUTES */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

/* MONGOOSE */
const PORT = process.env.PORT || 3005;
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true, 
    useUnifiedTopology: true
})
.then(() => {
    app.listen(PORT, () => console.log(`Server port: ${PORT}, DB connected`))
    /* ADD DATA ONE TIME */
    // User.insertMany(users)
    // Post.insertMany(posts)
}) 
.catch((err) => console.log(`${err}`))