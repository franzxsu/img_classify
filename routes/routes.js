const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const sharp = require('sharp');
const fs = require('fs').promises;

// Initialize Google Cloud Storage with service account credentials
const storage = new Storage();
const BUCKET_NAME = "img-classificationasdasd"; // Fixed bucket name
const bucket = storage.bucket(BUCKET_NAME);

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
        const classFiles = {};

        // Group files by class name
        for (const file of files) {
            const className = file.fieldname;
            if (!classFiles[className]) {
                classFiles[className] = [];
            }
            classFiles[className].push(file);
        }

        // Upload files to GCS with proper structure
        for (const className in classFiles) {
            for (const file of classFiles[className]) {
                const datasetCategory = getDatasetCategory(); // Assign dataset category

                // **Preprocess image (resize + convert to JPEG)**
                const processedImageBuffer = await sharp(file.path)
                    .resize(224, 224) // Resize to 224x224 for consistency
                    .toFormat('jpeg') // Convert to JPEG
                    .toBuffer();

                // Destination path in GCS
                const destFileName = `datasets/${datasetCategory}/${className}/${file.originalname}`;
                const gcsFile = bucket.file(destFileName);

                // Upload the processed image buffer to GCS
                await gcsFile.save(processedImageBuffer, {
                    contentType: 'image/jpeg', // Ensure correct content type
                });

                console.log(`Uploaded: gs://${BUCKET_NAME}/${destFileName}`);
            }
        }

        res.send(`Files successfully uploaded and structured in GCS.`);
    } catch (err) {
        console.error('Error processing upload:', err);
        res.status(500).send('Error uploading files.');
    }
})

function getDatasetCategory() {
    const random = Math.random();
    if (random < 0.7) return 'train';        // 70% training
    else if (random < 0.85) return 'validation'; // 15% validation
    else return 'test';                      // 15% test
}

module.exports = router;
