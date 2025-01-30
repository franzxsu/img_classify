const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const path = require('path');

const app = express();
const port = 3000;
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


AWS.config.update({ region: 'ap-southeast-2' });
const sagemaker = new AWS.SageMaker();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index', { progress: 0 });
});

app.post('/upload', upload.array('images'), (req, res) => {
  const files = req.files;
  if (!files || files.length === 0) {
    return res.status(400).send('No files uploaded.');
  }
  res.send('Files uploaded successfully.');
});

app.post('/train', (req, res) => {
  res.send('Training started.');

  
});

app.get('/progress', (req, res) => {
  res.json({ progress: 50 });
});

app.post('/predict', upload.single('image'), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('error, no image read');
  }
  res.json({ prediction: 'dog1111' }); //sample response
});

//start server
app.listen(port, () => {
  console.log(`SERVER RUNNING AT: http://localhost:${port}`);
});