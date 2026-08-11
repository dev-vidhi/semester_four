from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os
import gdown

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Download model from Google Drive if not exists
MODEL_PATH = "waste_model.h5"
if not os.path.exists(MODEL_PATH):
    print("Downloading model from Google Drive...")
    gdown.download(
        "https://drive.google.com/uc?id=1MvfK_mn1WEQhef0fhldRMlffy1Mq-SVr",
        MODEL_PATH,
        quiet=False
    )
    print("Model downloaded successfully!")

model = tf.keras.models.load_model(MODEL_PATH)

CLASSES = {
    0: {
        "label": "Organic Waste",
        "emoji": "🍃",
        "color": "#4CAF50",
        "tip": "Compost it! Organic waste can be turned into fertilizer."
    },
    1: {
        "label": "Recyclable Waste",
        "emoji": "♻️",
        "color": "#2196F3",
        "tip": "Recycle it! Clean and place in the recycling bin."
    }
}

def preprocess_image(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((224, 224))
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

@app.get("/")
def root():
    return {"message": "Waste Segregation API is running!"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    img_array = preprocess_image(contents)
    predictions = model.predict(img_array)
    class_idx = int(np.argmax(predictions[0]))
    confidence = float(np.max(predictions[0])) * 100
    result = CLASSES[class_idx]
    return {
        "class": result["label"],
        "emoji": result["emoji"],
        "color": result["color"],
        "tip": result["tip"],
        "confidence": round(confidence, 2)
    }