const express = require('express');
const session = require('express-session');
const firebase = require('firebase');
require('firebase/auth');
require('firebase/database');
const bodyParser = require('body-parser');
const path = require('path');
const engine = require('ejs-locals');
const flash = require('connect-flash');
const util = require('util');
const expressValidator = require('express-validator');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.use(express.static('static'));
app.engine('ejs', engine);
app.use(bodyParser.json ());
app.use(bodyParser.urlencoded ({
    extended: true
}));
app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true
}));
app.use(flash());

//Global vars for messages
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

app.use(bodyParser.json());
// app.use(expressValidator([options]));

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
    if(req.session.isLoggedIn){
        res.redirect('/admindashboard')
    }
        res.render('login.ejs', {isLoggedIn: req.session.isLoggedIn});
    });

app.get('/admindashboard', (req, res) => {
    if(!req.session.isLoggedIn){
        res.redirect('/')
    }
        const promise = new Promise(function(resolve, reject){
            database.ref('books').once('value').then( (snapshot) => {
                var data = snapshot.val();
                resolve(data);
            });
        });

        promise.then(function(books){
            res.render("admindashboard.ejs",  { books: books, isLoggedIn: req.session.isLoggedIn, user: req.session.user});
        });
    });

app.get('/home', (req, res) => {
    if(!req.session.isLoggedIn){
        res.redirect('/')
    }
        const promise = new Promise(function(resolve, reject){
            database.ref('books').once('value').then( (snapshot) => {
                var data = snapshot.val();
                resolve(data);
            });
        });

        promise.then(function(books){
            res.render("home.ejs",  { books: books, isLoggedIn: req.session.isLoggedIn, user: req.session.user});
        });
    });


app.get('/borrowed', (req, res) => {
    const promise = new Promise( (resolve, reject) => {
        database.ref('borrowed').once('value').then ( (snapshot) => {
            var data = snapshot.val();
            resolve(data);
        });
    });

    promise.then( (borrowedBook) => {
        res.render("borrowed.ejs", { books: borrowedBook, isLoggedIn: req.session.isLoggedIn, user: req.session.user});
    });
});

//delete a book from dashboard and database
app.get('/delete', (req, res) => {
    firebase.database().ref('/books/' + bookID).once('value').then(function(snapshot) {
  var book = snapshot.val().username;
  console.log(book);
});
});

app.post('/login', (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function (user) {
            var data = {
                uid: user.uid,
                email: user.email
            }
            req.session.user = data;
            req.session.isLoggedIn = true;
            if(data.email === 'ruthobey@gmail.com' || data.email === 'temitope.fowotade@andela.com') {
                res.redirect('/admindashboard');
            } else {
          res.redirect('/home');
      }
        })
        .catch(function (error) {
          // Handle Errors here.
          var errorMessage = error.message;
          req.session.destroy();
          console.log(errorMessage);// req.flash('success_msg', 'You have successfully input a product');
          
          res.redirect('/');
        });
});

app.post('/signup', (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    var confirmPassword = req.body.confirm_password;

    if(password !== confirmPassword){
        console.log('password does not match.');
        res.redirect('/');
    } else {
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(function () {
              firebase.auth().signInWithEmailAndPassword(email, password)
                .then(function (user) {
                    var data = {
                        uid: user.uid,
                        email: user.email
                    }
                    //push user detail into database
                    firebase.database().ref('users').push(data);
                    req.session.user = data;
                    req.session.isLoggedIn = true; 
                  res.redirect('/home');
                })
                .catch(function (error) {
                  // Handle Errors here.
                  var errorMessage = error.message;
                  req.session.destroy();
                  console.log(errorMessage);
                  res.redirect('/');
                });
            })
            .catch(function (error) {
              var errorMessage = error.message;
              console.log(errorMessage);
            });
          }
});

//send books to database
app.post('/book', (req, res) => {

    var data = {
        bookID: req.body.bookId,
        category: req.body.bookCategory,
        bookTitle: req.body.bookTitle,
        bookAuthor: req.body.bookAuthor,
        qty: req.body.bookQuantity
    };
    if(typeof data.bookID !== "number"){
        console.log('pls enter  a string');
    }
    firebase.database().ref('books').push(data);
    res.redirect('/admindashboard');
});

app.post('/borrow', (req, res) => {
    var id = req.query.id
    firebase.database.ref('borrowed').once('value').thend   (function(snapshot){

    })
    res.redirect('/admindashboard')
})

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
})


app.listen(3000, () => {
    console.log('listening on port 3000')
})
