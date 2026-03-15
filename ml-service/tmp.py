"""from PIL import Image
from inference.dr_predict import predict_dr

img = Image.new('RGB', (224, 224), color=(128, 64, 32))

try:
    result = predict_dr(img)
    print('SUCCESS:', result['prediction'], result['confidence'])
except Exception as e:
    import traceback
    traceback.print_exc()"""

import matplotlib.pyplot as plt
import numpy as np

fig, ax = plt.subplots(figsize=(8, 8))
ax.set_aspect('equal')
ax.axis('off')

center_x, center_y = 0, 0
radii = [1, 5, 10]
ring_colors = ['#ff4c4c', '#ffa64c', '#4c99ff']

ax.plot(center_x, center_y, 'ro', markersize=10, label='Alert Origin')

for r, color in zip(radii, ring_colors):
    circle = plt.Circle((center_x, center_y), r, color=color, fill=False, linestyle='dashed', linewidth=2)
    ax.add_patch(circle)
    ax.text(0, r + 0.3, f'{r} km', ha='center', color=color, fontweight='bold')

np.random.seed(42)
num_users = 80
angles = np.random.uniform(0, 2 * np.pi, num_users)
distances = np.random.uniform(0, 14, num_users)

user_x = distances * np.cos(angles)
user_y = distances * np.sin(angles)

inside_x = [x for x, d in zip(user_x, distances) if d <= 10]
inside_y = [y for y, d in zip(user_y, distances) if d <= 10]
outside_x = [x for x, d in zip(user_x, distances) if d > 10]
outside_y = [y for y, d in zip(user_y, distances) if d > 10]

ax.scatter(inside_x, inside_y, c='#2ecc71', s=30, label='Users Notified (Inside)', zorder=3)
ax.scatter(outside_x, outside_y, c='#bdc3c7', s=30, label='Users Ignored (Outside)', zorder=3)

ax.legend(loc='upper right', bbox_to_anchor=(1.15, 1.1))
plt.title("Proximity-Based Alert ($nearSphere)", pad=20, fontweight='bold')

plt.tight_layout()
plt.savefig("geo_radius_map.png", dpi=300, bbox_inches='tight')
print("Successfully generated geo_radius_map.png!")