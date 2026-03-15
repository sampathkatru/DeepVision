import torch
from torchvision import transforms
from PIL import Image

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD  = [0.229, 0.224, 0.225]

inference_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
])

def preprocess_image(pil_image: Image.Image) -> torch.Tensor:
    """Convert PIL image to normalized tensor ready for model inference."""
    tensor = inference_transform(pil_image)
    return tensor.unsqueeze(0)
