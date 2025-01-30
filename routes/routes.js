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

router.post('/upload', upload.any(), async (req, res) => {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).send('No files uploaded.');
    }
  
    try {
      console.log('Files received:', files); // Log the files
  
      // Organize files by class
      const classFiles = {};
      for (const file of files) {
        const className = file.fieldname; // Fieldname is the class name
        if (!classFiles[className]) {
          classFiles[className] = [];
        }
        classFiles[className].push(file);
      }
  
      // Upload files to S3
      for (const className in classFiles) {
        for (const file of classFiles[className]) {
          const params = {
            Bucket: "image-classify-uploads",
            Key: `datasets/${className}/${file.originalname}`, // Store in class-specific folder
            Body: fs.createReadStream(file.path), // Stream the file
          };
  
          console.log('Uploading file:', file.originalname); // Log the file being uploaded
  
          const uploadResult = await s3.upload(params).promise();
          console.log('File uploaded successfully:', uploadResult.Location); // Log the S3 URL
  
          fs.unlinkSync(file.path); // Delete the local file
        }
      }
  
      res.send('Files uploaded to S3 successfully.');
    } catch (err) {
      console.error('Error uploading files to S3:', err); // Log the error
      res.status(500).send('Error uploading files to S3.');
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