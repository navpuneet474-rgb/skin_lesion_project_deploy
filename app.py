from __future__ import annotations

from pathlib import Path
from typing import Tuple

import numpy as np
import tensorflow as tf
from flask import Flask, jsonify, render_template, request
from PIL import Image, UnidentifiedImageError

APP_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = APP_DIR.parent
MODEL_DIR = PROJECT_ROOT / "notebooks"
MODEL_FILE = "final_model_new.keras"

IMG_SIZE: Tuple[int, int] = (224, 224)
THRESHOLD = 0.33


def find_model_path() -> Path:
    candidate = MODEL_DIR / MODEL_FILE
    if candidate.exists():
        return candidate
    raise FileNotFoundError(
        f"Required model not found: {MODEL_FILE} in notebooks/."
    )


def load_model() -> tf.keras.Model:
    model_path = find_model_path()
    print(f"[INFO] Loading model from: {model_path}")
    return tf.keras.models.load_model(model_path)


def preprocess_image(file_obj) -> np.ndarray:
    """Match notebook preprocessing: RGB -> 224x224 -> normalize [0,1] -> batch."""
    image = Image.open(file_obj).convert("RGB")
    image = image.resize(IMG_SIZE, Image.Resampling.BILINEAR)
    image_array = np.asarray(image, dtype=np.float32) / 255.0
    return np.expand_dims(image_array, axis=0)


app = Flask(__name__, template_folder="templates", static_folder="static")
model = load_model()


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

    probability = float(model.predict(batch, verbose=0)[0][0])
    predicted_label = "Melanoma" if probability >= THRESHOLD else "Non-Melanoma"

    return jsonify(
        {
            "status": "success",
            "predicted_label": predicted_label,
            "melanoma_probability": round(probability, 4),
            "threshold": THRESHOLD,
            "disclaimer": "This is a screening tool, not a diagnosis. Consult a dermatologist.",
        }
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
