# img_classify
cloud computing based image classification model 

# Build the Docker image
docker build -t sklearn-processing .

# Tag the Docker image
docker tag sklearn-processing:latest 8699-3507-6851.dkr.ecr.ap-southeast-2.amazonaws.com/sklearn-processing:latest

# Push the Docker image to ECR
docker push 8699-3507-6851.dkr.ecr.ap-southeast-2.amazonaws.com/sklearn-processing:latest






node server.js