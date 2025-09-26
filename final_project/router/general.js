const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!isValid(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    const bookList = await new Promise((resolve, reject) => {
        resolve(books);
    });
    
    return res.status(200).json({ books: bookList });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const book = await new Promise((resolve, reject) => {
        const isbn = req.params.isbn;
        const book = books[isbn];
        resolve(book);
    });

    if (book) {
        return res.status(200).json(book);
    } else {
        return res.status(404).json({message: `Book with ISBN ${isbn} not found.`});
    }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const matchingBooks = await new Promise((resolve, reject) => {
        const author = req.params.author;
        const matchedBooks = Object.values(books).filter(book => 
            book.author && book.author.toLowerCase() === author.toLowerCase()
        );
        resolve(matchedBooks);
    });

    if (matchingBooks.length > 0) {
        return res.status(200).json({booksbyauthor: matchingBooks});
    } else {
        return res.status(404).json({message: `No books found by the author '${author}'.`});
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const matchingBooks = await new Promise((resolve, reject) => {
        const title = req.params.title;
        const matchingBooks = Object.values(books).filter(book => 
            book.title.toLowerCase().includes(title.toLowerCase())
        );
        resolve(matchedBooks);
    });

    if (matchingBooks.length > 0) {
        return res.status(200).json({booksbytitle: matchingBooks});
    } else {
        return res.status(404).json({message: `No books found with title containing '${title}'.`});
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        // Return only the reviews object for the specified book
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({message: `Book with ISBN ${isbn} not found.`});
    }
});

module.exports.general = public_users;
