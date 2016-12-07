
// var user = firebase.auth().currentUser;
// if (user) {
//   console.log("You've signed in");
// }

$(function(){
$("#loginForm").submit(function(e){
e.preventDefault();
var email = e.currentTarget.email.value;
var password = e.currentTarget.password.value;
// console.log(email, password);

//Registering a new user
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(function () {
      firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function () {
          window.location = "dashboard";
        })
        .catch(function (error) {
          // Handle Errors here.
          var errorMessage = error.message;
          alert(errorMessage);
        });
    })
    .catch(function (error) {
      var errorMessage = error.message;
      alert(errorMessage);
    });
  });
});

  
$(function(){
$("#newBook").click(function(e){
e.preventDefault();
var bookId = e.currentTarget.bookId.value;
var bookCategory = e.currentTarget.bookCategory.value;
var bookTitle = e.currentTarget.bookTitle.value;
var bookAuthor = e.currentTarget.bookAuthor.value;
var bookQuantity = e.currentTarget.bookQuantity.value;

console.log(bookId);
});

});