// https://cloud.google.com/vertex-ai/docs/image-data/classification/create-dataset?hl=en#aiplatform_create_dataset_image_sample-nodejs

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
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

let imageMetadata = [];

router.get('/', (req, res) => {
    res.render('index', { progress: 0 });
});

router.post('/upload', upload.any(), async (req, res) => {
    const files = req.files;
    if (!files || files.length === 0) {
        return res.status(400).send('No files uploaded.');
    }

    try {
        let imageMetadata = [];

        for (const file of files) {
            const className = file.fieldname;
            const datasetCategory = getDatasetCategory();

            // Resize & Convert to JPEG
            const processedImageBuffer = await sharp(file.path)
                .resize(224, 224)
                .toFormat('jpeg')
                .toBuffer();

            // GCS Destination
            const destFileName = `datasets/${datasetCategory}/${className}/${file.originalname}`;
            const gcsFile = bucket.file(destFileName);

            // Upload Image
            await gcsFile.save(processedImageBuffer, {
                contentType: 'image/jpeg',
            });

            // Store metadata for JSONL
            imageMetadata.push({
                imageGcsUri: `gs://${BUCKET_NAME}/${destFileName}`,
                classificationAnnotation: { displayName: className },
                dataItemResourceLabels: {
                    "aiplatform.googleapis.com/ml_use": datasetCategory,
                },
            });

            console.log(`Uploaded: gs://${BUCKET_NAME}/${destFileName}`);
        }

        // Generate and upload JSONL after all files are uploaded
        const jsonlPath = path.join(__dirname, 'image_data.jsonl');
        const jsonlContent = imageMetadata.map(obj => JSON.stringify(obj)).join('\n');

        await fs.writeFile(jsonlPath, jsonlContent);

        // Upload JSONL to GCS
        const jsonlDestination = 'datasets/image_data.jsonl';
        await bucket.upload(jsonlPath, { destination: jsonlDestination });

        await fs.unlink(jsonlPath); // Cleanup

        res.status(200).json({
            message: "Files uploaded and JSONL file generated.",
            jsonlUri: `gs://${BUCKET_NAME}/${jsonlDestination}`,
        });

    } catch (err) {
        console.error('Upload Error:', err);
        res.status(500).send('Error uploading files.');
    }
});

function getDatasetCategory() {
    const random = Math.random();
    if (random < 0.7) return 'train';        // 70% training
    else if (random < 0.85) return 'validation'; // 15% validation
    else return 'test';                      // 15% test
}

module.exports = router;
