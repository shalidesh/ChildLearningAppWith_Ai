from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from PIL import Image
import requests

# load image from the IAM database (actually this model is meant to be used on printed text)
url = './images/desk.jpeg'
image = Image.open(url).convert("RGB")

modelpath='./models/microsofttrocr-small-printed/'

processor = TrOCRProcessor.from_pretrained(modelpath)
model = VisionEncoderDecoderModel.from_pretrained(modelpath)
pixel_values = processor(images=image, return_tensors="pt").pixel_values

generated_ids = model.generate(pixel_values)
generated_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
print(generated_text)

