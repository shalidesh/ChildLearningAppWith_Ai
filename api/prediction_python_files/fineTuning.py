from PIL import Image
import os
from transformers import TrOCRProcessor, VisionEncoderDecoderModel, Trainer, TrainingArguments

# Set the path to the folder containing the images
src_folder = 'path/to/src_folder'

# Load the pre-trained model and tokenizer
processor = TrOCRProcessor.from_pretrained('microsoft/trocr-small-printed')
model = VisionEncoderDecoderModel.from_pretrained('microsoft/trocr-small-printed')

# Initialize lists to store the images and labels
images = []
labels = []

# Iterate over the files in the src_folder
for filename in os.listdir(src_folder):
    # Load the image from the file as a PIL Image object
    image = Image.open(os.path.join(src_folder, filename)).convert('RGB')
    # Extract the label from the filename
    label = os.path.splitext(filename)[0]
    # Append the image and label to the lists
    images.append(image)
    labels.append(label)

# Convert the lists of images and labels into a dataset
dataset = {'image': images, 'text': labels}

# Define a function to preprocess the data
def preprocess_function(examples):
    pixel_values = processor(images=examples['image'], return_tensors='pt').pixel_values
    labels = processor(text=examples['text'], return_tensors='pt').input_ids
    return {'pixel_values': pixel_values, 'labels': labels}

# Preprocess the data
dataset = preprocess_function(dataset)

# Define the training arguments
training_args = TrainingArguments(
    output_dir='./results',
    evaluation_strategy='epoch',
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    learning_rate=2e-5,
    num_train_epochs=3,
)

# Create a Trainer instance
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset['train'],
    eval_dataset=dataset['validation'],
)

# Train the model
trainer.train()

# Save the fine-tuned model to a local directory
model.save_pretrained('path/to/save_directory')

