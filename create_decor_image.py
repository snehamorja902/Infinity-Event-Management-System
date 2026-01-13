from PIL import Image, ImageDraw, ImageFont, ImageFilter
import random

def create_luxury_decor_image(path):
    # Create a base image with a luxury gradient
    width, height = 1024, 768
    image = Image.new('RGB', (width, height), color='#f9f9f9')
    draw = ImageDraw.Draw(image)
    
    # Draw some abstract floral shapes or elegant patterns
    for i in range(10):
        x = random.randint(0, width)
        y = random.randint(0, height)
        size = random.randint(50, 200)
        draw.ellipse([x, y, x+size, y+size], fill='#e0d5b5', outline=None)
        
    # Apply a blur to make it soft background-like
    image = image.filter(ImageFilter.GaussianBlur(20))
    
    # Add text "Luxury Decor" in center
    # Since we might not have a font, we'll skip complex text or use default
    # Just save the pattern
    
    image.save(path)
    print(f"Created {path}")

create_luxury_decor_image('c:/Users/sneha/OneDrive/Desktop/internship/frontend/public/cat_decor.png')
