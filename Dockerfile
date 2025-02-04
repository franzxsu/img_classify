FROM python:3.9

# Install dependencies
RUN pip install --no-cache-dir tensorflow pillow numpy

# Set the working directory
WORKDIR /opt/ml/code

# Copy script to container
COPY preprocess.py .

# Define the entrypoint
ENTRYPOINT ["python", "preprocess.py"]
