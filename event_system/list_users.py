import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'event_system.settings')
django.setup()

from main.models import User

users = User.objects.all()
print(f"{'ID':<5} | {'Username':<15} | {'Role':<10} | {'Is Staff':<10} | {'Is Super':<10}")
print("-" * 60)
for u in users:
    print(f"{u.id:<5} | {u.username:<15} | {u.role:<10} | {u.is_staff:<10} | {u.is_superuser:<10}")
