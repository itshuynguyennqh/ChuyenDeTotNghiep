-- Script để sửa lỗi encoding cho bảng FAQ
-- Chạy script này trong SQL Server Management Studio hoặc Azure Data Studio

USE [final_project_getout]
GO

-- 1. Kiểm tra kiểu dữ liệu hiện tại của các cột
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'FAQ'
AND COLUMN_NAME IN ('Question', 'Answer', 'Keywords')
GO

-- 2. Nếu các cột đang là VARCHAR, chuyển sang NVARCHAR để hỗ trợ Unicode
-- Lưu ý: Script này sẽ giữ nguyên dữ liệu hiện có

-- Backup dữ liệu trước khi sửa (tùy chọn)
-- SELECT * INTO FAQ_backup FROM FAQ
-- GO

-- Chuyển đổi cột Question sang NVARCHAR(MAX)
IF EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'FAQ' 
    AND COLUMN_NAME = 'Question' 
    AND DATA_TYPE = 'varchar'
)
BEGIN
    ALTER TABLE [dbo].[FAQ] 
    ALTER COLUMN [Question] NVARCHAR(MAX) NOT NULL
    PRINT 'Đã chuyển cột Question sang NVARCHAR(MAX)'
END
ELSE
BEGIN
    PRINT 'Cột Question đã là NVARCHAR hoặc không tồn tại'
END
GO

-- Chuyển đổi cột Answer sang NVARCHAR(MAX)
IF EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'FAQ' 
    AND COLUMN_NAME = 'Answer' 
    AND DATA_TYPE = 'varchar'
)
BEGIN
    ALTER TABLE [dbo].[FAQ] 
    ALTER COLUMN [Answer] NVARCHAR(MAX) NOT NULL
    PRINT 'Đã chuyển cột Answer sang NVARCHAR(MAX)'
END
ELSE
BEGIN
    PRINT 'Cột Answer đã là NVARCHAR hoặc không tồn tại'
END
GO

-- Chuyển đổi cột Keywords sang NVARCHAR(MAX)
IF EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'FAQ' 
    AND COLUMN_NAME = 'Keywords' 
    AND DATA_TYPE = 'varchar'
)
BEGIN
    ALTER TABLE [dbo].[FAQ] 
    ALTER COLUMN [Keywords] NVARCHAR(MAX) NULL
    PRINT 'Đã chuyển cột Keywords sang NVARCHAR(MAX)'
END
ELSE
BEGIN
    PRINT 'Cột Keywords đã là NVARCHAR hoặc không tồn tại'
END
GO

-- 3. Kiểm tra lại sau khi sửa
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'FAQ'
AND COLUMN_NAME IN ('Question', 'Answer', 'Keywords')
GO

PRINT 'Hoàn tất! Các cột đã được chuyển sang NVARCHAR để hỗ trợ Unicode.'
PRINT 'Lưu ý: Dữ liệu cũ có thể đã bị lỗi encoding. Bạn có thể cần nhập lại dữ liệu tiếng Việt.'
