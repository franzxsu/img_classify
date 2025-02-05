const { DatasetServiceClient } = require('@google-cloud/aiplatform');

const PROJECT_ID = 'your-project-id'; // Replace with your actual project ID
const LOCATION = 'us-central1'; // Replace with your region
const DATASET_DISPLAY_NAME = 'Image Classification Dataset'; // Name for your dataset

async function createDataset() {
    const client = new DatasetServiceClient();

    const request = {
        parent: `projects/${PROJECT_ID}/locations/${LOCATION}`,
        dataset: {
            displayName: DATASET_DISPLAY_NAME,
            metadataSchemaUri: 'gs://google-cloud-aiplatform/schema/dataset/metadata/image_1.0.0.yaml',
            metadata: {
                // Specify the input data configuration for image classification
                inputDataConfig: [
                    {
                        gcsSource: {
                            inputUris: [
                                'gs://img-classificationasdasd/datasets/train/',
                                'gs://img-classificationasdasd/datasets/validation/',
                                'gs://img-classificationasdasd/datasets/test/',
                            ],
                        },
                    },
                ],
            },
        },
    };

    try {
        console.log('Creating dataset...');
        const [operation] = await client.createDataset(request);
        const [dataset] = await operation.promise();
        console.log(`Dataset created successfully: ${dataset.name}`);
        return dataset.name; // Return dataset ID
    } catch (err) {
        console.error("Failed to create dataset:", err);
        throw new Error(err.message); // Rethrow error for handling
    }
}

// Call the function to create the dataset
createDataset().catch(console.error);
