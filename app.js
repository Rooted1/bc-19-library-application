const express = require('express');
const path = require('path');
const app = express();

app.set('views', path.join(__dirname, 'views'));
app.disable('view cache');
app.use(express.static('static'));

app.get('/', (req, res) => {

        const name = "University Library";
        
         res.render("index.ejs",  { sendNameToTemplate: name});
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
