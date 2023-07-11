from flask import Flask, request
import base64
from PIL import Image
from io import BytesIO

import cv2
import typing
import numpy as np

from mltu.inferenceModel import OnnxInferenceModel
from mltu.utils.text_utils import ctc_decoder, get_cer

import pandas as pd
from tqdm import tqdm
from mltu.configs import BaseModelConfigs

from prediction_python_files.inferenceModel import ImageToWordModel


app = Flask(__name__)

@app.route('/save', methods=['POST'])
def save_image():
    image_data = request.json['image']
    with open('image.jpg', 'wb') as f:
        f.write(base64.b64decode(image_data))
    return {"success": "Image received and saved"}


# @app.route('/uploadimage', methods=['POST'])
# def upload_image():
#     # Get the image data from the request body
#     data = request.get_json()
#     print("image recieved")
#     image_data = data['imageData']

#     # Decode the base64 encoded image data
#     image_data = base64.b64decode(image_data.split(',')[1])

#     # Create a PIL Image object from the decoded image data
#     image = Image.open(BytesIO(image_data))

#     # Save the image to a file in the backend directory
#     image.save('image1.png')

#     text=""

#     return {"success": "Image received and saved","text":text}

from PIL import Image, ImageDraw

@app.route('/uploadimage', methods=['POST'])
def upload_image():
    # Get the image data from the request body
    data = request.get_json()
    print("image received")
    image_data = data['imageData']

    # Decode the base64 encoded image data
    image_data = base64.b64decode(image_data.split(',')[1])

    # Create a PIL Image object from the decoded image data
    image = Image.open(BytesIO(image_data))

    # Create a new white background image with the same size as the original image
    white_bg = Image.new('RGBA', image.size, (255, 255, 255, 255))
    
    # Paste the original image onto the white background
    white_bg.paste(image, (0, 0), image)
    
    # Cut the bottom section of the image
    width, height = white_bg.size
    white_bg = white_bg.crop((0, 0, width, height*0.32))

    # # Save the resulting image to a file in the backend directory
    # white_bg.save('recievedImages//image2.png')
    
    # Convert the PIL Image object to a NumPy array
    image_np = np.array(white_bg)

    # Remove the alpha channel from the image
    image_np = image_np[:, :, :3]

    configs = BaseModelConfigs.load("models/03_handwriting_recognition/202301111911/configs.yaml")

    model = ImageToWordModel(model_path=configs.model_path, char_list=configs.vocab)

    # image = cv2.imread('recievedImages//image3.png')

    prediction_text = model.predict(image_np)

    print(f"Prediction: {prediction_text}")

    return {"success": "Image received and saved","text":prediction_text}


if __name__ == '__main__':
    app.run()
