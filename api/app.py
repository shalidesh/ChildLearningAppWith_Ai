from flask import Flask, request
import base64
from PIL import Image
from io import BytesIO

app = Flask(__name__)

@app.route('/uploadimage', methods=['POST'])
def upload_image():
    # Get the image data from the request body
    data = request.get_json()
    image_data = data['imageData']

    # Decode the base64 encoded image data
    image_data = base64.b64decode(image_data.split(',')[1])

    # Create a PIL Image object from the decoded image data
    image = Image.open(BytesIO(image_data))

    # Save the image to a file in the backend directory
    image.save('image.png')

    return 'Image received and saved'

if __name__ == '__main__':
    app.run()
