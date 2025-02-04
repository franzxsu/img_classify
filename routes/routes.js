const express = require('express');
const router = express.Router();
const multer = require('multer');
const {Storage} = require('@google-cloud/storage');

const sharp = require('sharp');
const fs = require('fs').promises;

// Initialize Google Cloud Storage with service account credentials
const storage = new Storage({
    
});

router.get('/', (req, res) => {

    res.render('index', {
    progress: 0
    });
});

// Function to generate a unique bucket name (you can customize this)
function generateBucketName() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15); // Add some randomness
    return `image-classification-bucket-${timestamp}-${random}`; // Or any scheme you like
}


// Multer setup
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/');
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + '-' + file.originalname);
        },
    })
});

router.post('/upload', upload.any(), async (req, res) => {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).send('No files uploaded.');
    }
  
    try {
      const bucketName = generateBucketName();
      await storage.createBucket(bucketName);
      console.log(`Bucket ${bucketName} created successfully.`);
  
      const bucket = storage.bucket(bucketName);
  
      const classFiles = {};
      for (const file of files) {
        const className = file.fieldname;
        if (!classFiles[className]) {
          classFiles[className] = [];
        }
        classFiles[className].push(file);
      }
  
      for (const className in classFiles) {
        for (const file of classFiles[className]) {

          const processedImageBuffer = await sharp(file.path)
            .resize(224, 224)
            .toFormat('jpeg')
            .toBuffer();
  
          const destFileName = `datasets/${className}/${file.originalname}`;
  
          // Use save() instead of upload() to upload processed image buffer
          const processedFile = bucket.file(destFileName);
          await processedFile.save(processedImageBuffer, {
            contentType: 'image/jpeg', // Set content type to match format
          });
  
          console.log(`Processed file ${file.originalname} uploaded to gs://${bucketName}/${destFileName}`);
        }
      }
  
      res.send(`Files uploaded to bucket ${bucketName} successfully.`);
    } catch (err) {
      console.error('Error uploading files or creating bucket:', err);
      res.status(500).send('Error uploading files or creating bucket.');
    }
  });

module.exports = router;