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
app.set('view engine', 'ejs');
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

const isLoggedIn = (req, res, next) => {
    if(!req.session.isLoggedIn){
        res.redirect('/');
    }
    next();
}

app.get('/', (req, res) => {
    if(req.session.isLoggedIn){
        res.redirect('/admindashboard')
    }
        res.render('login', {isLoggedIn: req.session.isLoggedIn});
    });

app.get('/admindashboard', isLoggedIn, (req, res) => {

            database.ref('books').once('value').then( (snapshot) => {
               res.render("admindashboard",  { books: snapshot.val(), isLoggedIn: req.session.isLoggedIn, user: req.session.user});
            });
    });

app.get('/home', isLoggedIn, (req, res) => {
            database.ref('books').once('value').then( (snapshot) => {
                res.render("home",  { books: snapshot.val(), isLoggedIn: req.session.isLoggedIn, user: req.session.user});
            });
});


app.get('/borrowed', isLoggedIn, (req, res) => {
        database.ref('borrowed').once('value').then ( (snapshot) => {
            var data = snapshot.val();
            res.render("borrowed", { books: data, isLoggedIn: req.session.isLoggedIn, user: req.session.user});
        });
});

app.post('/login', (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function (user) {
            firebase.database().ref('users/' + user.uid).once('value').then((snapshot) => {
                var data = snapshot.val();
                if(data){
                var userData = {
                    uid: user.uid,
                    email: user.email,
                    role: data.role
                }
                req.session.user = userData;
                req.session.isLoggedIn = true;
                if(data.role === 'subscriber') {
                    res.redirect('/home');
                } else {
                    res.redirect('/admindashboard');
                 }
             } else{
                res.redirect('/');
                q
             }
            }).catch(function(error){
                var errorMessage = error.message;
                req.session.destroy();
                console.log(errorMessage);
                res.redirect('/');
            })
            
        })
        .catch(function (error) {
          // Handle Errors here.
          var errorMessage = error.message;
          req.session.destroy();
          console.log(errorMessage);
          
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
            .then(function (user) {
                firebase.database().ref('users/' + user.uid).set({
                    role: 'subscriber',
                    email: user.email
                });
              firebase.auth().signInWithEmailAndPassword(email, password)
                .then(function (user) {
                    var data = {
                        uid: user.uid,
                        email: user.email
                    }
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
app.post('/book', isLoggedIn, (req, res) => {

    var data = {
        bookID: req.body.bookId,
        category: req.body.bookCategory,
        bookTitle: req.body.bookTitle,
        bookAuthor: req.body.bookAuthor,
        qty: req.body.bookQuantity
    };
    firebase.database().ref('books').push(data);
    res.redirect('/admindashboard');
});

//delete a book from dashboard and database
app.post('/delete/:bookID', isLoggedIn, (req, res) => {
    var bookId = req.params.bookID;
    firebase.database().ref().child('/books/' + bookId).remove().then((snapshot) => {
        res.redirect('/admindashboard');
    })
});

app.post('/borrow/:category', (req, res) => {

    const data  = req.body;
    data.email = req.session.user.email;
    firebase.database().ref('borrowed').push(data);
    res.redirect('/home');

});

app.post('/return/:id', (req, res) => {
    var data = req.params.bookID;
    firebase.database().ref('books').push(data);
    res.redirect('/borrowed');
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});


app.listen(3000, () => {
    console.log('listening on port 3000')
})
