const express = require('express');
const router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

router.get('/', (req, res) => {
  res.render('index', { progress: 0 });
});

router.post('/upload', upload.array('images'), (req, res) => {
  const files = req.files;
  if (!files || files.length === 0) {
    return res.status(400).send('No files uploaded.');
  }
  res.send('Files uploaded successfully.');
});

router.post('/train', (req, res) => {
  res.send('Training started.');

  
});

router.get('/progress', (req, res) => {
  res.json({ progress: 50 });
});

router.post('/predict', upload.single('image'), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('error, no image read');
  }
  res.json({ prediction: 'dog1111' }); //sample response
});










module.exports = router;