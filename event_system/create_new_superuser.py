import os
import django
from django.contrib.auth import get_user_model

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'event_system.settings')
django.setup()

User = get_user_model()
username = 'superadmin'
password = 'Superadmin@123'
email = 'superadmin@example.com'

if not User.objects.filter(username=username).exists():
    print(f"Creating new superuser: {username}")
    user = User.objects.create_superuser(username=username, email=email, password=password)
    user.role = 'ADMIN' # Crucial for your Admin Dashboard frontend redirection
    user.save()
    print(f"Superuser '{username}' created successfully with role 'ADMIN'.")
else:
    print(f"User '{username}' already exists. Updating role and password...")
    user = User.objects.get(username=username)
    user.set_password(password)
    user.is_superuser = True
    user.is_staff = True
    user.role = 'ADMIN'
    user.save()
    print(f"User '{username}' updated successfully.")
