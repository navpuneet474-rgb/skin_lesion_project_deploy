from __future__ import annotations
from pathlib import Path
from typing import Tuple
import os
import numpy as np
import tensorflow as tf
from tensorflow import keras
from flask import Flask, jsonify, render_template, request
from PIL import Image, UnidentifiedImageError

MODEL_PATH = Path(__file__).parent / "final_model_new.keras"
IMG_SIZE: Tuple[int, int] = (224, 224)
THRESHOLD = 0.33

app = Flask(__name__, template_folder="templates", static_folder="static")

_model = None

def find_model_path() -> Path:
    if MODEL_PATH.exists():
        return MODEL_PATH
    raise FileNotFoundError(f"Model not found: {MODEL_PATH}")

def get_model() -> tf.keras.Model:
    global _model
    if _model is None:
        model_path = find_model_path()
        print(f"[INFO] Loading model from: {model_path}", flush=True)
        _model = tf.keras.models.load_model(model_path)
        print("[INFO] Model loaded successfully.", flush=True)
    return _model

def preprocess_image(file_obj) -> np.ndarray:
    image = Image.open(file_obj).convert("RGB")
    image = image.resize(IMG_SIZE, Image.Resampling.BILINEAR)
    image_array = np.asarray(image, dtype=np.float32) / 255.0
    return np.expand_dims(image_array, axis=0)

@app.get("/")
def index():
    return render_template("index.html")

@app.post("/predict")
def predict():
    if "file" not in request.files:
        return jsonify({"status": "error", "message": "No file part in request."}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"status": "error", "message": "No file selected."}), 400

    try:
        batch = preprocess_image(file)
    except (UnidentifiedImageError, OSError):
        return jsonify({"status": "error", "message": "Invalid image file."}), 400

    try:
        model = get_model()
        probability = float(model.predict(batch, verbose=0)[0][0])
    except Exception as e:
        print(f"[ERROR] Prediction failed: {e}", flush=True)
        return jsonify({"status": "error", "message": "Model prediction failed."}), 500

    predicted_label = "Melanoma" if probability >= THRESHOLD else "Non-Melanoma"

    return jsonify({
        "status": "success",
        "predicted_label": predicted_label,
        "melanoma_probability": round(probability, 4),
        "threshold": THRESHOLD,
        "disclaimer": "This is a screening tool, not a diagnosis. Consult a dermatologist.",
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
