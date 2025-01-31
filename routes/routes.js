const express = require('express');
const router = express.Router();
const multer = require('multer');
const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');


const s3 = new AWS.S3({
    region: 'ap-southeast-2',
});
const sagemaker = new AWS.SageMaker({ 
  region: 'ap-southeast-2'
 });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});
const upload = multer({
    storage
});

router.get('/', (req, res) => {
    res.render('index', {
        progress: 0
    });
});

router.post('/upload', upload.any(), async (req, res) => {
    const files = req.files;
    if (!files || files.length === 0) {
        return res.status(400).send('No files uploaded.');
    }

    try {
        console.log('Files received:', files);

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

        //PREPROCESSING 
        const processingJobParams = {
            ProcessingJobName: `image-preprocessing-${Date.now()}`, // Unique job name
            ProcessingResources: {
                ClusterConfig: {
                    InstanceCount: 1,
                    InstanceType: 'ml.m5.large', // Instance type for processing
                    VolumeSizeInGB: 50, // Size of the EBS volume
                },
            },
            AppSpecification: {
                ImageUri: '382416733822.dkr.ecr.us-east-1.amazonaws.com/sklearn-processing:latest', // Preprocessing container image
            },
            RoleArn: 'arn:aws:iam::869935076851:role/amazonsagemaker', // Replace with your SageMaker role ARN
            ProcessingInputs: [{
                InputName: 'input-data',
                S3Input: {
                    S3Uri: 's3://image-classify-uploads/datasets/', // Path to raw data in S3
                    LocalPath: '/opt/ml/processing/input', // Local path in the processing container
                    S3DataType: 'S3Prefix',
                    S3InputMode: 'File',
                },
            }, ],
            ProcessingOutputConfig: {
                Outputs: [{
                    OutputName: 'output-data',
                    S3Output: {
                        S3Uri: 's3://image-classify-preprocessed/datasets/', // Path to save preprocessed data
                        LocalPath: '/opt/ml/processing/output', // Local path in the processing container
                        S3UploadMode: 'EndOfJob',
                    },
                }, ],
            },
        };

        const processingJob = await sagemaker.createProcessingJob(processingJobParams).promise();
        console.log('Processing job started:', processingJob.ProcessingJobArn);

        res.send('Files uploaded to S3 and preprocessing job started.');
    } catch (err) {
        console.error('Error uploading files to S3:', err); // Log the error
        res.status(500).send('Error uploading files to S3.');
    }
});


router.post('/train', (req, res) => {
    res.send('Training started.');


});

router.get('/progress', (req, res) => {
    res.json({
        progress: 50
    }); //sample only
});

router.post('/predict', upload.single('image'), (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).send('error, no image read');
    }
    res.json({
        prediction: 'dog (69.420%)'
    }); //sample response
});

module.exports = router;