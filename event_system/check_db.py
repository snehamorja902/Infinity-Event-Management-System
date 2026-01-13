import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'event_system.settings')
django.setup()

from main.models import User, Booking, ConcertBooking, FestivalBooking, Tournament, SportsRegistration, JobApplication, Blog

models = [User, Booking, ConcertBooking, FestivalBooking, Tournament, SportsRegistration, JobApplication, Blog]

for model in models:
    print(f"{model.__name__}: {model.objects.count()}")
