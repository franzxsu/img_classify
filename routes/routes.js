const express = require('express');
const router = express.Router();
const multer = require('multer');
const {Storage} = require('@google-cloud/storage');
const fs = require('fs');

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
                const destFileName = `datasets/${className}/${file.originalname}`;
                await bucket.upload(file.path, {
                    destination: destFileName,
                    metadata: {
                        contentType: file.mimetype,
                    },
                });

                console.log(`File ${file.originalname} uploaded to gs://${bucketName}/${destFileName}`);
                fs.unlinkSync(file.path); // Delete the local file
            }
        }

        res.send(`Files uploaded to bucket ${bucketName} successfully.`); // Send back bucket name
    } catch (err) {
        console.error('Error uploading files or creating bucket:', err);
        res.status(500).send('Error uploading files or creating bucket.');
    }
});

module.exports = router;