import boto3

s3_bucket = "img-classification"
account_id="982081072345"
script_path = f"s3://{s3_bucket}/scripts/preprocess.py"
input_data_path = f"s3://{s3_bucket}/datasets/"
output_data_path = f"s3://{s3_bucket}/processed/"

sagemaker_client = boto3.client("sagemaker")

processing_job_name = "image-preprocessing-job"

response = sagemaker_client.create_processing_job(
    ProcessingJobName=processing_job_name,
    RoleArn=f"arn:aws:iam::{account_id}:role/darrenfranzsagemaker",
    ProcessingInputs=[
        {
            "InputName": "input-images",
            "S3Input": {
                "S3Uri": input_data_path,
                "LocalPath": "/opt/ml/processing/input",
                "S3DataType": "S3Prefix",
                "S3InputMode": "File",
            },
        }
    ],
    ProcessingOutputConfig={
        "Outputs": [
            {
                "OutputName": "processed-images",
                "S3Output": {
                    "S3Uri": output_data_path,
                    "LocalPath": "/opt/ml/processing/output",
                    "S3UploadMode": "EndOfJob",
                },
            }
        ]
    },
    ProcessingResources={
        "ClusterConfig": {
            "InstanceCount": 1,
            "InstanceType": "ml.t3.medium",
            "VolumeSizeInGB": 10,
        }
    },
    AppSpecification={
        "ImageUri": f"{account_id}.dkr.ecr.us-east-1.amazonaws.com/tensorflow-processing:2.9-cpu-py39",
        "ContainerArguments": ["--input-dir", "/opt/ml/processing/input", "--output-dir", "/opt/ml/processing/output"],
        "ContainerEntrypoint": ["python3", "/opt/ml/processing/input/preprocess.py"],
    },
)

print("Processing job started:", response)
