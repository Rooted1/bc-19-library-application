  // const firebase = require('firebase');

  //setup and initialize Firebase
  src="https://www.gstatic.com/firebasejs/live/3.0/firebase.js">
  var config = {
    apiKey: "AIzaSyCfONITbfT3fLf2miCa4ryLqdAdlr7xq7g",
    authDomain: "library-application-d0904.firebaseapp.com",
    databaseURL: "https://library-application-d0904.firebaseio.com",
    storageBucket: "library-application-d0904.appspot.com",
    messagingSenderId: "121811453489"
  };
  firebase.initializeApp(config);

  var newUserKey = firebase.database().ref().child('Users');
 //  var newBookKey = firebase.database().ref().child('Books');

 //  // Write the new user's data simultaneously in the user list.
  var updates = {};
  updates.userId = '#2040';
  updates.name = 'Aromosola';

  newUserKey.update(updates).then(res => console.log(res)).catch(err => console.log(err, ' there is an'));
   newUserKey.on('value',function(snapshot) {
      console.log(snapshot.val(), 'value');
 });
  // var books = {};
 //  books.bookId = '#1001';
 //  books.bookTitle = 'The Gods are not dead';
 //  books.bookAuthor = 'Wole Soyinka';

 //  newBookKey.update(books).then(res => console.log(res)).catch(err => console.log(err, ' there is an'));
 //   newBookKey.on('value',function(snapshot) {
 //      console.log(snapshot.val(), 'value');
 // });

//  function writeNewPost(bkid, name, title, body) {
//   // A post entry.
//   var book = {
//     author: name,
//     bkid: bkid,
//     body: body,
//     title: title,
//     starCount: 0,
//   };

//   // Get a key for a new Post.
//   var newBookKey = firebase.database().ref().child('book').push().key;

//   // Write the new post's data simultaneously in the posts list and the user's post list.
//   var updates = {};
//   updates['/book/' + newBookKey] = book;
//   updates['/user-posts/' + uid + '/' + newBookKey] = book;

//   return firebase.database().ref().update(updates);
// }


//  $(document).ready(function(){
//     alert('it works!');
//  //            $(".subBtn").click(function(){
//  //              var newStu = firebase.database().ref().child('Stu');
//  //                var newUser = {};
//  //                newUser.name = $('.name').val();
//  //                newUser.email = $('.email').val();
//  //                newUser.uid = $('.uid').val();
//  //                newUser.psw = $('.psw').val();
//  //                newUser.psw2 = $('.psw2').val();
//  //         //            $("#subBtn").click(function(event){
//  //         // event.preventDefault();

//  //                newStu.update(newUser).then(res => console.log(res)).catch(err => console.log(err, ' there is an'));
//  //                 newStu.on('value',function(snapshot) {
//  //                    console.log(snapshot.val(), 'value');
//  //        });
//  //                 // }
//  // });
// });