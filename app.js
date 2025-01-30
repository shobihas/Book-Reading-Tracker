
var express = require('express');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require("uuid")
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken');
const app = express();
const cors=require('cors');
const authMiddleWare=require('./middlewares/auth.js');
app.use(express.json());
app.use(cors());

mongoose.connect(
    "mongodb+srv://shobii1808:shobi@cluster0.qt0yggf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
)
    .then(() => {
        console.log("Connected to DB")
    });

const userSchema = new mongoose.Schema({
    id:String,
    name: String,
    email: String,
    password: String,
    age: Number,
    phone: String,
    genres: String,
    dob: String,
    gender: String
})
const bookSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    category: { type: String, required: true },
    publishedYear: { type: Number, required: true },
    description: { type: String },
    status: { type: String },
    image: { type: String }
});

const Book = mongoose.model('Book', bookSchema);
const User = mongoose.model('User', userSchema);


app.post("/signup", async(req,res)=>{
    const {id, name, email, password, age, phone,dob, gender} = req.body;
    try{
        const user = await User.findOne({ email });
        if(user){

            return res.status(400).json({message: 'Email already exists'})
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            id, name, email, password: hashedPassword, age, phone,dob, gender
        });
        console.log(newUser);
        await newUser.save();
        res.json({message: "User created successfully"})
    }
    catch(error){
        console.log(error);
        res.status(500).json({message: "Internal server error"})
    }
});
app.post('/signin',async(req,res)=>{
    const{email,password}=req.body;
    try{
        const user= await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"Invalid email"})
        }
        const isValidPassword=await bcrypt.compare(password,user.password);
        if(!isValidPassword){
            return res.status(400).json({message:"Invalid password"})
        }
        const token=jwt.sign({id:user.id},"secret_key",{expiresIn:"1h"})
        res.status(200).json(token);
    }
    catch(error){
        res.status(500).json({message:"Error signing in",error});
    }
})
// app.get('/api/user', authMiddleWare,async (req, res) => {
//     try {
//         const user = await User.findOneById(req.params.id);
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         res.status(200).json(user);
//     } catch (err) {
//         res.status(500).json({ message: 'Error retrieving user', error: err });
//     }
// });
app.get('/api/user/:email', authMiddleWare,async (req, res) => {
    try {
        const user = await Book.findOneById(req.params.email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving book', error: err });
    }
}); 
app.get('/api/books',authMiddleWare,async(req,res)=>{
    try{
    const books=await Book.find();
    console.log(books);
    res.json(books)    }
    catch(err){
        res.json({message:err.message})
    }
})
app.get('/api/books/:id', authMiddleWare,async (req, res) => {
    try {
        const book = await Book.findOneById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(200).json(book);
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving book', error: err });
    }
}); 

app.post('/api/books', authMiddleWare, async (req, res) => {
    const { title, author, category, publishedYear, description, status, image } = req.body; // Add image here
    try {
      const newBook = new Book({
        id: uuidv4(),
        title,
        author,
        category,
        publishedYear,
        description,
        status,
        image, // Include image
      });
      const savedBook = await newBook.save();
      res.status(201).json(savedBook);
    } catch (err) {
      res.status(500).json({ message: 'Error adding book', error: err });
    }
  });


app.put('/api/books/:id', authMiddleWare,async (req, res) => {
    const { id } = req.params;
    const { title, author, category, publishedYear, description, status } = req.body;
    try {
        const updatedBook = await Book.findOneAndUpdate(
            { id },
            { title, author, category, publishedYear, description, status });
        if (!updatedBook) return res.status(404).json({ message: 'Book not found' });
        res.status(200).json(updatedBook);
    } catch (err) {
        res.status(500).json({ message: 'Error updating book', error: err });
    }
});


app.delete('/api/books/:id', authMiddleWare, async (req, res) => {
    try {
      const { id } = req.params; // Extract id directly
      const deletedBook = await Book.deleteOne({ id }); // Use { id }
      if (!deletedBook.deletedCount) return res.status(404).json({ message: 'Book not found' });
      res.status(200).json({ message: 'Book deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting book', error: err });
    } 
  });
app.listen(3000, () => {
    console.log("Server is running on Port 3000")
})
