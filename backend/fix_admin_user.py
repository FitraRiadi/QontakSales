import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'qontak_sales.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

try:
    user = User.objects.get(username='admin')
    user.username = 'admin@qontak.com'
    user.save()
    print(f'Fixed: admin -> {user.username}')
except User.DoesNotExist:
    print('User "admin" not found')
