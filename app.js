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
       
        res.render('login.ejs');
    });

app.get('/dashboard', (req, res) => {
    if(!req.session.isLoggedIn){
        res.redirect('/login')
    }
        const promise = new Promise(function(resolve, reject){
            database.ref('books').once('value').then( (snapshot) => {
                var data = snapshot.val();
                resolve(data);
            });
        });

        promise.then(function(books){
            res.render("dashboard.ejs",  { books: books});
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
        res.render("borrowed.ejs", { books: borrowedBook});
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

app.post('/dashboard', (req, res) => {
        console.log(JSON.stringify(req.body));
        
      var newBookDetails = new Book({ bookId: req.body.book_id, bookCategory: req.body.book_category, bookTitle: req.body.book_title, bookAuthor: req.body.book_author, qty: req.body.book_qty });
        newBookDetails.save((err, firstResponse) => { 
    res.redirect('/dashboard');
});
});

app.listen(3000, () => {
    console.log('listening on port 3000')
})
