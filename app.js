const express = require('express');
const firebase = require('firebase');
require('firebase/auth');
require('firebase/database');
const path = require('path');
const app = express();
const engine = require('ejs-locals');

app.set('views', path.join(__dirname, 'views'));
app.use(express.static('static'));
app.engine('ejs', engine);

  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyCfONITbfT3fLf2miCa4ryLqdAdlr7xq7g",
    authDomain: "library-application-d0904.firebaseapp.com",
    databaseURL: "https://library-application-d0904.firebaseio.com",
    storageBucket: "library-application-d0904.appspot.com",
    messagingSenderId: "121811453489"
  };
firebase.initializeApp(config);
const database = firebase.database();

app.get('/', (req, res) => {
        const name = "University Library";
        res.render('login.ejs');
    });

app.get('/borrowed', (req, res) => {
        var books = [];
        const a = database.ref('books').once('value').then( (snapshot) => {
            var data = snapshot.val()
            books.push(data)
        });
         res.render("borrowed.ejs",  { books: books});
    });

app.get('/dashboard', (req, res) => {
        var books = [];
        const a = database.ref('books').once('value').then( (snapshot) => {
            var data = snapshot.val()
            books.push(data)
        });
         res.render("dashboard.ejs",  { books: books});
    });

app.post('/dashboard', (req, res) => {

      var newBookDetails = new Book({ bookId: req.body.book_id, bookCategory: req.body.book_category, bookTitle: req.body.book_title, bookAuthor: req.body.book_author, qty: req.body.book_qty });

        newBookDetails.save((err, firstResponse) => { 
    res.redirect('/dashboard');
});
});

app.listen(3000, () => {
    console.log('listening on port 3000')
})
