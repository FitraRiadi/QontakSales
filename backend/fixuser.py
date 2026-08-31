import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'qontak_sales.settings')
django.setup()

from django.contrib.auth import get_user_model
from qontak_sales.apps.accounts.models import Company

User = get_user_model()
company, _ = Company.objects.get_or_create(name='QontakSales Demo')
user = User.objects.get(username='admin')
user.company = company
user.role = 'MANAGER'
user.first_name = 'Admin'
user.last_name = 'User'
user.save()
print(f'User updated: {user.username} -> company={company.name}, role={user.role}')
