const express = require('express');
session = require('express-session');
const firebase = require('firebase');
    require('firebase/auth');
    require('firebase/database');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const engine = require('ejs-locals');

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
        res.redirect('/dashboard')
    }
        res.render('login.ejs', {isLoggedIn: req.session.isLoggedIn});
    });

app.get('/dashboard', (req, res) => {
    if(!req.session.isLoggedIn){
        res.redirect('/')
    }
        const promise = new Promise(function(resolve, reject){
            database.ref('books').once('value').then( (snapshot) => {
                var data = snapshot.val();
                console.log(data);
                resolve(data);
            });
        });

        promise.then(function(books){
            res.render("dashboard.ejs",  { books: books, isLoggedIn: req.session.isLoggedIn, user: req.session.user});
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
          res.redirect('/dashboard');
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
            .then(function () {
              firebase.auth().signInWithEmailAndPassword(email, password)
                .then(function (user) {
                    var data = {
                        uid: user.uid,
                        email: user.email
                    }
                    req.session.user = data;
                    req.session.isLoggedIn = true; 
                  res.redirect('/dashboard');
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

app.post('/book', (req, res) => {

    var data = {
        bookID: req.body.bookId,
        category: req.body.bookCategory,
        bookTitle: req.body.bookTitle,
        bookAuthor: req.body.bookAuthor,
        qty: req.body.bookQuantity
    };
    console.log(data);
    firebase.database().ref('books').push(data);
    res.redirect('/dashboard');
});

app.post('/borrowed', (req, res) => {
    firebase.database.ref('borrowed').once('value').then(function(snapshot){
        
    })
})

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
})


app.listen(3000, () => {
    console.log('listening on port 3000')
})
