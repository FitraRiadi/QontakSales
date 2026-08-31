import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'qontak_sales.settings')
django.setup()

from django.contrib.auth import get_user_model
from qontak_sales.apps.accounts.models import Company

User = get_user_model()

if not User.objects.filter(username='admin').exists():
    company = Company.objects.create(name='QontakSales Demo')
    User.objects.create_superuser(
        username='admin',
        email='admin@qontak.com',
        password='admin123',
        first_name='Admin',
        last_name='User',
        company=company,
        role='MANAGER'
    )
    print('Superuser created: admin@qontak.com / admin123')
else:
    print('Superuser already exists')
