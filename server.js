const express = require('express');
const routes = require('./routes/routes.js');

const path = require('path');

const app = express();
const port = 3000;
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.static('public'));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use('/', routes);

//start server
app.listen(port, () => {
  console.log(`SERVER RUNNING AT: http://localhost:${port}`);
});

