import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'event_system.settings')
django.setup()

from main.models import Decoration

def seed_decorations():
    decorations = [
        {
            "name": "Royal Garden Gala",
            "price": 50000.00,
            "image": "https://www.paperlesspost.com/blog/wp-content/uploads/Blog00_GalaThemes_Centerpiece.png",
            "description": "A majestic outdoor setup with floral arches and elegant seating."
        },
        {
            "name": "Midnight Velvet Theme",
            "price": 42000.00,
            "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-Y_o4tVM5pr-i-aJMgGzEadOgt-JHTiMefw&s",
            "description": "Deep velvet textures and warm amber lighting for a cozy lounge feel."
        },
        {
            "name": "Traditional Marigold",
            "price": 15000.00,
            "image": "https://www.kidsgen.com/events/diwali/images/fresh-flower-diwali-decorations.jpg",
            "description": "Vibrant marigolds and traditional brass elements for a soulful event."
        },
        {
            "name": "Modern Tech Stage",
            "price": 60000.00,
            "image": "https://orlandosydney.com/wp-content/uploads/2017/12/Gala-Dinner-ICC-Sydney-Grand-Ball-Room-orlandosydney.com-OS2_6124.jpg",
            "description": "Sleek LED backdrops and state-of-the-art sound/lighting configuration."
        }
    ]

    for d in decorations:
        Decoration.objects.get_or_create(
            name=d['name'],
            defaults={
                'price': d['price'],
                'image': d['image'],
                'description': d['description']
            }
        )
    print("Database seeded with decorations!")

if __name__ == "__main__":
    seed_decorations()
