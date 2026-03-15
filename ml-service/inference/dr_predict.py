import torch
import torch.nn as nn
import timm
import json
from pathlib import Path

from utils.preprocess import preprocess_image
from gradcam.gradcam import generate_gradcam_overlay

BASE_DIR    = Path(__file__).parent.parent
CONFIG_PATH = BASE_DIR / "configs" / "dr_model_config.json"
MODEL_PATH  = BASE_DIR / "models" / "dr_model.pth"

with open(CONFIG_PATH) as f:
    config = json.load(f)

CLASS_NAMES = config.get("class_names", ["Normal", "Diabetic Retinopathy"])

class DRClassifier(nn.Module):
    def __init__(self, num_classes=2):
        super().__init__()
        self.backbone = timm.create_model("efficientnet_b3", pretrained=False, num_classes=0)
        in_features = self.backbone.num_features
        self.classifier = nn.Sequential(
            nn.Dropout(0.4),
            nn.Dropout(0.4),
            nn.BatchNorm1d(in_features),
            nn.Dropout(0.3),
            nn.Linear(in_features, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, num_classes),
        )

    def forward(self, x):
        features = self.backbone(x)
        return self.classifier(features)

_model = None

def _get_model():
    global _model
    if _model is None:
        _model = DRClassifier(num_classes=len(CLASS_NAMES))
        state = torch.load(MODEL_PATH, map_location="cpu", weights_only=False)
        if isinstance(state, dict) and "model_state_dict" in state:
            state = state["model_state_dict"]
        elif isinstance(state, dict) and "state_dict" in state:
            state = state["state_dict"]
        if isinstance(state, DRClassifier):
            _model = state
        else:
            _model.load_state_dict(state)
        _model.eval()
    return _model

def predict_dr(pil_image):
    model = _get_model()
    tensor = preprocess_image(pil_image)

    with torch.no_grad():
        logits = model(tensor)
        probs  = torch.softmax(logits, dim=1).squeeze()

    confidence = float(probs.max())
    class_idx  = int(probs.argmax())
    prediction = CLASS_NAMES[class_idx]

    target_layer = model.backbone.blocks[-1][-1].conv_pw
    gradcam_b64, _ = generate_gradcam_overlay(model, target_layer, tensor, pil_image)

    return {
        "disease":    "Diabetic Retinopathy",
        "prediction": prediction,
        "confidence": round(confidence, 4),
        "probabilities": {
            CLASS_NAMES[i]: round(float(probs[i]), 4)
            for i in range(len(CLASS_NAMES))
        },
        "gradcam": gradcam_b64,
    }