from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from store.models import Employees, Customer, CustomerEmailAddress

class Command(BaseCommand):
    help = 'Đồng bộ người dùng từ bảng Employees và Customer sang bảng auth_user của Django'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Bắt đầu quá trình đồng bộ người dùng...'))

        default_password = 'password123' # LƯU Ý: vấn đề bảo mật, chỉ thực hiện trong môi trường demo và kiểm thử

        # --- 1. Đồng bộ từ bảng Employees ---
        self.stdout.write('Đang đồng bộ từ bảng Employees...')
        synced_employees = 0
        for employee in Employees.objects.all():
            # Dùng email làm username, nếu không có email thì bỏ qua
            if not employee.emailaddress:
                self.stdout.write(self.style.WARNING(f'Bỏ qua Employee ID {employee.businessentityid} vì không có email.'))
                continue

            username = employee.emailaddress.lower()
            
            # Kiểm tra xem user đã tồn tại trong bảng auth_user chưa
            if not User.objects.filter(username=username).exists():
                try:
                    # Tách tên
                    full_name_parts = employee.fullname.split()
                    first_name = full_name_parts[0]
                    last_name = ' '.join(full_name_parts[1:]) if len(full_name_parts) > 1 else ''

                    user = User.objects.create_user(
                        username=username,
                        email=username,
                        password=default_password,
                        first_name=first_name,
                        last_name=last_name,
                        is_staff=True # Đánh dấu là nhân viên
                    )
                    synced_employees += 1
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Lỗi khi tạo user cho Employee {username}: {e}'))
        
        self.stdout.write(self.style.SUCCESS(f'Đồng bộ thành công {synced_employees} nhân viên.'))

        # --- 2. Đồng bộ từ bảng Customer ---
        self.stdout.write('Đang đồng bộ từ bảng Customer...')
        synced_customers = 0
        # Lấy tất cả khách hàng có email
        customers_with_email = CustomerEmailAddress.objects.select_related('customerid').all()

        for customer_email in customers_with_email:
            customer = customer_email.customerid
            if not customer_email.emailaddress:
                continue

            username = customer_email.emailaddress.lower()

            if not User.objects.filter(username=username).exists():
                try:
                    user = User.objects.create_user(
                        username=username,
                        email=username,
                        password=default_password,
                        first_name=customer.firstname or '',
                        last_name=customer.lastname or ''
                    )
                    synced_customers += 1
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Lỗi khi tạo user cho Customer {username}: {e}'))

        self.stdout.write(self.style.SUCCESS(f'Đồng bộ thành công {synced_customers} khách hàng.'))
        self.stdout.write(self.style.SUCCESS('Hoàn tất!'))
