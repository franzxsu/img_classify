const {Storage} = require('@google-cloud/storage');

// Create a storage client
const storage = new Storage();

// The name for the new bucket (must be globally unique)
const bucketName = 'your-unique-bucket-nameawdawdawdawd'; // Replace with a globally unique name

async function createBucket() {
  try {
    // Create a new bucket
    const [bucket] = await storage.createBucket(bucketName);
    console.log(`Bucket ${bucket.name} created.`);
  } catch (err) {
    console.error('Error creating bucket:', err);
  }
}

createBucket();
