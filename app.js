const express = require('express');
const session = require('express-session');
const firebase = require('firebase');
require('firebase/auth');
require('firebase/database');
const bodyParser = require('body-parser');
const path = require('path');
const engine = require('ejs-locals');
const flash = require('req-flash');
const util = require('util');
require ('dotenv') .config();
const request = express.request;

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
    apiKey: process.env.FIREBASE_APIKEY,
    authDomain: process.env.FIREBASE_AUTHDOMAIN,
    databaseURL: process.env.FIREBASE_DATABASEURL,
    storageBucket: process.env.FIREBASE_STORAGEBUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGINGSENDERID
  };
firebase.initializeApp(config);
const database = firebase.database();

const isLoggedIn = (req, res, next) => {
    if(!req.session.isLoggedIn){
        res.redirect('/');
    }
    next();
}

//testing mailchimp api
app.get('/subscribe', (req, res) => {
    res.render('subscribe');
});
app.post('/subscribe', function(req, res) {
    addEmailToMailchimp(req.body.email)
    res.end('Yay! You\'ve just subscried to our monthly newsletter');
});

function addEmailToMailchimp (email) {
    // var request = require("request");

    var options = { method: 'POST',
      url: 'https://us16.api.mailchimp.com/3.0/lists/719b7726e2/members',
      headers: 
       { 'postman-token': '96eca650-8a99-140c-6467-a85df34d23eb',
         'cache-control': 'no-cache',
         authorization: 'Basic YXN0cmluZzplMmMyMDc4YWJjOGJhMGQ4MjU4YjAwYzg5NWI2NjJhNC11czE2',
         'content-type': 'application/json' },
      body: { email_address: email, status: 'subscribed' },
      json: true };

    request(options, function (error, response, body) {
      if (error) throw new Error(error);

      console.log(body);
});

}

app.get('/', (req, res) => {
    // if(req.session.isLoggedIn){
    //     res.redirect('/admindashboard')
    // }
        res.render('login');
    });

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/admindashboard', (req, res) => {

            database.ref('books').once('value').then( (snapshot) => {
               res.render("admindashboard",  { books: snapshot.val(), user: req.session.user});
            });
    });

app.get('/home', (req, res) => {
            database.ref('books').once('value').then( (snapshot) => {
                res.render("home",  { books: snapshot.val(), user: req.session.user});
            });
});


app.get('/borrowed', (req, res) => {
        database.ref('borrowed').once('value').then( (snapshot) => {
            var data = snapshot.val();
            res.render("borrowed", { books: data, user: req.session.user});
        });
});

app.get('/adminview', (req, res) => {
        database.ref('borrowed').once('value').then ( (snapshot) => {
            var data = snapshot.val();
            res.render("adminview", { books: data, user: req.session.user});
        });
});

app.post('/login', (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function (user) {
            firebase.database().ref('users/' + user.uid).once('value').then((snapshot) => {
                // res.send(snapshot.val());
                var data = snapshot.val();
                if (data) {
                    var userData = {
                        uid: user.uid,
                        email: user.email,
                        role: data.role
                    }
                    req.session.user = userData;
                    // req.session.isLoggedIn = true;
                    if(data.role) {
                        res.redirect('/home');
                    } else {
                        res.redirect('/login');
                     }
                 } else {
                    res.redirect('/admindashboard');
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
        alert('password does not match.');
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
                    // req.session.isLoggedIn = true; 
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
    firebase.database().ref('books').push(data);
    res.redirect('/admindashboard');
});

//delete a book from dashboard and database
app.post('/delete/:bookID', (req, res) => {
    var bookId = req.params.bookID;
    firebase.database().ref().child('/books/' + bookId).remove().then((snapshot) => {
        res.redirect('/admindashboard');
    })
});

app.post('/borrow/:category', (req, res) => {

    const data  = req.body;
    // data.email = req.session.user.email;
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
