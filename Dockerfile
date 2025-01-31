FROM python:3.8-slim

# Install dependencies
RUN pip install pillow tensorflow

COPY preprocess.py /opt/ml/processing/preprocess.py

ENTRYPOINT ["python", "/opt/ml/processing/preprocess.py"]