const express = require('express');
const routes = require('./routes/routes.js');

const AWS = require('aws-sdk');
const path = require('path');

const app = express();
const port = 3000;
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


AWS.config.update({ region: 'ap-southeast-2' });
const sagemaker = new AWS.SageMaker();

app.use(express.static('public'));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use('/', routes);

//start server
app.listen(port, () => {
  console.log(`SERVER RUNNING AT: http://localhost:${port}`);
});

