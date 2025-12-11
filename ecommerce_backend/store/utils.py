from django.db import connection

def execute_procedure(proc_name, params=None):
    """
    Hàm helper để gọi Stored Procedure trong SQL Server.
    :param proc_name: Tên procedure (ví dụ: 'dbo.Dang_Ky_Tai_Khoan')
    :param params: List các tham số truyền vào (ví dụ: ['user1', 'pass123'])
    :return: List các dictionary kết quả (nếu có) hoặc None
    """
    if params is None:
        params = []

    with connection.cursor() as cursor:
        # Tạo chuỗi placeholder: %s, %s, %s ...
        placeholders = ', '.join(['%s'] * len(params))
        sql = f"EXEC {proc_name} {placeholders}"
        
        try:
            cursor.execute(sql, params)
            
            # Nếu procedure trả về dữ liệu (SELECT), convert sang dict
            if cursor.description:
                columns = [col[0] for col in cursor.description]
                results = [
                    dict(zip(columns, row))
                    for row in cursor.fetchall()
                ]
                return results
            
            # Nếu chỉ thực hiện hành động (INSERT, UPDATE, DELETE)
            return {"message": "Procedure executed successfully"}
            
        except Exception as e:
            # Ném lỗi ra để View xử lý
            raise e
