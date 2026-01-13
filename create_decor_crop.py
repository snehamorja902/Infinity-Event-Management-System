from PIL import Image

def create_decor_crop():
    try:
        # Open the destination wedding image (Beach wedding with floral arch)
        img = Image.open('c:/Users/sneha/OneDrive/Desktop/internship/frontend/public/cat_dest_wedding.png')
        
        # Crop to focus on the floral details (assuming arch is somewhat central/left)
        # Original is likely 1024x1024
        width, height = img.size
        
        # Crop a square/rectangle from the center-left where an arch usually is
        # Let's verify size first, but assuming 1024x1024
        
        # Crop box: (left, top, right, bottom)
        # Focus on the left-center where the arch usually sits in these compositions
        left = width * 0.1
        top = height * 0.2
        right = width * 0.6
        bottom = height * 0.8
        
        cropped_img = img.crop((left, top, right, bottom))
        
        # Resize back to a good thumbnail size for consistency if needed, or just save
        cropped_img = cropped_img.resize((800, 600), Image.Resampling.LANCZOS)
        
        output_path = 'c:/Users/sneha/OneDrive/Desktop/internship/frontend/public/cat_decor.png'
        cropped_img.save(output_path)
        print(f"Successfully created decor image at {output_path}")
        
    except Exception as e:
        print(f"Error: {e}")

create_decor_crop()
