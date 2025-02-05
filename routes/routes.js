const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const sharp = require('sharp');
const fs = require('fs').promises;

// Initialize Google Cloud Storage with service account credentials
const storage = new Storage();
const bucketName = "img-classificationasdasd"; // Fixed bucket name
const bucket = storage.bucket(bucketName);

// Multer setup
const upload = multer({
    storage: multer.diskStorage({
        destination: 'uploads/',
        filename: (req, file, cb) => {
            cb(null, Date.now() + '-' + file.originalname);
        },
    }),
});

router.get('/', (req, res) => {
    res.render('index', { progress: 0 });
});

router.post('/upload', upload.any(), async (req, res) => {
    const files = req.files;
    if (!files || files.length === 0) {
        return res.status(400).send('No files uploaded.');
    }

    try {
        // Organize files by class (fieldname = class label)
        const classFiles = {};
        for (const file of files) {
            const className = file.fieldname; // Class name from fieldname
            if (!classFiles[className]) {
                classFiles[className] = [];
            }
            classFiles[className].push(file);
        }

        // Upload images to the correct structure
        for (const className in classFiles) {
            for (const file of classFiles[className]) {
                // Process the image (resize & convert to JPEG)
                const processedImageBuffer = await sharp(file.path)
                    .resize(224, 224)
                    .toFormat('jpeg')
                    .toBuffer();

                const destFileName = `datasets/${className}/${file.originalname}`;
                const processedFile = bucket.file(destFileName);

                // Upload processed image buffer
                await processedFile.save(processedImageBuffer, {
                    contentType: 'image/jpeg',
                });

                console.log(`Uploaded: gs://${bucketName}/${destFileName}`);
            }
        }

        res.send(`Files uploaded successfully to gs://${bucketName}/datasets/`);
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).send('Error uploading files.');
    }
});

module.exports = router;
