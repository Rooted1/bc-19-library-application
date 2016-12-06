const express = require('express');
const path = require('path');
const app = express();
const engine = require('ejs-locals');

app.set('views', path.join(__dirname, 'views'));
app.use(express.static('static'));
app.engine('ejs', engine)

app.get('/', (req, res) => {

        const name = "University Library";
        
         res.render("login.ejs",  { sendNameToTemplate: name});
    });

app.get('/borrowed', (req, res) => {
        
         res.render('borrowed.ejs');
        
    });

app.get('/dashboard', (req, res) => {
        const name = "Welcome to Admin Dashboard";
        
         res.render("dashboard.ejs",  { sendNameToTemplate: name});
    });


app.listen(3000, function(){
    console.log('listening on port 3000')
})
