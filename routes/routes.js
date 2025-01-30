const express = require('express');
const router = express.Router();
const multer = require('multer');
const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');

const s3 = new AWS.S3({
  region: 'ap-southeast-2',
});


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

router.post('/upload', upload.array('images'), async (req, res) => {
    const files = req.files;
    if (!files || files.length === 0) {
        console.log("no files")
      return res.status(400).send('no files uploaded');
    }
  
    try {
      const classFiles = {};
      for (const file of files) {
        
        const className = file.fieldname;
        console.log(className)
        if (!classFiles[className]) {
          classFiles[className] = [];
        }
        classFiles[className].push(file);
      }
  
      //upload files to S3
      for (const className in classFiles) {
        for (const file of classFiles[className]) {
          const params = {
            Bucket: "image-classify-uploads",

            //NOT WORKING!!!
            Key: `datasets/${className}/${file.filename}`,
            
            Body: fs.createReadStream(file.path),
          };
          await s3.upload(params).promise();
          fs.unlinkSync(file.path);
        }
      }
      console.log("ok")
      res.send('file upload successful');
    } catch (err) {
        console.log("er")
      console.error(err);
      res.status(500).send('error uploading to s3');
    }
  });


router.post('/train', (req, res) => {
  res.send('Training started.');

  
});

router.get('/progress', (req, res) => {
  res.json({ progress: 50 });//sample only
});

router.post('/predict', upload.single('image'), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('error, no image read');
  }
  res.json({ prediction: 'dog (69.420%)' }); //sample response
});










module.exports = router;