const express = require('express');
// var firebase = require('firebase');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', path.join(__dirname, 'views'));

app.use(express.public('public'));

app.get('/', (res, req) => {
     var newPostKey = firebase.database().ref().child('posts');

  // Write the new post's data simultaneously in the posts list and the user's post list.
  var updates = {};
  updates.name = String;
  updates.username = String;
  updates.psw = String;
  updates.psw2 = String;
newPostKey.update(updates).then(res => console.log(res)).catch(err => console.log(err, ' there is an'));
 newPostKey.on('value',function(snapshot) {
    console.log(snapshot.val(), 'value')
 })
})