import os
import argparse
from PIL import Image
import numpy as np
from tensorflow.keras.preprocessing.image import ImageDataGenerator

parser = argparse.ArgumentParser()
parser.add_argument('--input-dir', type=str, default='/opt/ml/processing/input')
parser.add_argument('--output-dir', type=str, default='/opt/ml/processing/output')
args = parser.parse_args()

# Resize and normalize images
for class_name in os.listdir(args.input_dir):
    class_dir = os.path.join(args.input_dir, class_name)
    output_class_dir = os.path.join(args.output_dir, class_name)
    os.makedirs(output_class_dir, exist_ok=True)

    for image_name in os.listdir(class_dir):
        image_path = os.path.join(class_dir, image_name)
        output_image_path = os.path.join(output_class_dir, image_name)

        # Open and resize image
        image = Image.open(image_path)
        image = image.resize((224, 224))

        # Normalize pixel values
        image = image.convert('RGB')
        image.save(output_image_path)

# Data augmentation
datagen = ImageDataGenerator(
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    fill_mode='nearest'
)

# Apply augmentation and save augmented images
for class_name in os.listdir(args.output_dir):
    class_dir = os.path.join(args.output_dir, class_name)
    for image_name in os.listdir(class_dir):
        image_path = os.path.join(class_dir, image_name)
        image = Image.open(image_path)
        image = np.array(image)
        image = np.expand_dims(image, axis=0)

        # Generate augmented images
        i = 0
        for batch in datagen.flow(image, batch_size=1, save_to_dir=class_dir, save_prefix='aug', save_format='jpg'):
            i += 1
            if i > 5:  # Generate 5 augmented images per original image
                break