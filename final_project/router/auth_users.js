const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    const foundUsers = Object.values(users).filter(user => 
        user.username === username
    );

    return foundUsers.length > 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
    const foundUsers = Object.values(users).filter(user => 
        user.username === username && user.password === password
    );

    return foundUsers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 10 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

regd_users.put("/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    
    const username = req.session.authorization.username;

    if (!review) {
        return res.status(400).json({message: "Review content is required."});
    }

    const book = books[isbn];

    if (!book) {
        return res.status(404).json({message: `Book with ISBN ${isbn} not found.`});
    }

    book.reviews[username] = review;
    books[isbn] = book;

    return res.status(200).json({
        message: `Review for ISBN ${isbn} successfully added/updated by user ${username}.`,
        reviews: book.reviews
    });
});

regd_users.delete("/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;

    const book = books[isbn];

    if (!book) {
        return res.status(404).json({message: `Book with ISBN ${isbn} not found.`});
    }
    
    if (book.reviews && book.reviews[username]) {
        delete book.reviews[username];

        books[isbn] = book;

        return res.status(200).json({
            message: `Review posted by user ${username} for ISBN ${isbn} successfully deleted.`,
            reviews: book.reviews
        });
    } else {
        return res.status(404).json({message: `No review found from user ${username} for ISBN ${isbn}.`});
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
