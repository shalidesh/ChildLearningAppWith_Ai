from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from PIL import Image

# Load the fine-tuned model and tokenizer from the local directory
processor = TrOCRProcessor.from_pretrained('path/to/save_directory')
model = VisionEncoderDecoderModel.from_pretrained('path/to/save_directory')

# Load an image from a file as a PIL Image object
image = Image.open('image.jpg').convert('RGB')

# Pass the image to the processor to obtain the pixel values
pixel_values = processor(images=image, return_tensors='pt').pixel_values

# Generate text from the image using the fine-tuned model
generated_ids = model.generate(pixel_values)
generated_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]

# Print the generated text
print(generated_text)
