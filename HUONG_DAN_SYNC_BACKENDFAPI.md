# Hướng dẫn đồng bộ backendfapi với backend repository

## Tổng quan

Thư mục `backendfapi` trong project này cần được đồng bộ với repository `https://github.com/BaDai116/kumo_chuyende`.

## Cách 1: Sử dụng script PowerShell (Khuyến nghị)

### Push backendfapi lên backend repository

```powershell
.\sync_backendfapi.ps1 -Push
```

Script sẽ:
1. Kiểm tra và nhắc bạn commit các thay đổi chưa commit
2. Clone backend repository vào thư mục tạm
3. Copy tất cả files từ `backendfapi/` sang backend repo
4. Commit và push lên backend repository

### Pull từ backend repository về backendfapi

```powershell
.\sync_backendfapi.ps1 -Pull
```

**Lưu ý:** Thao tác này sẽ ghi đè các file trong `backendfapi/`!

### Kiểm tra trạng thái

```powershell
.\sync_backendfapi.ps1 -Status
```

## Cách 2: Sử dụng Git Subtree (Nâng cao)

Nếu bạn muốn sử dụng git subtree để quản lý backendfapi như một subtree:

### Thiết lập lần đầu (nếu chưa có)

```bash
# Thêm subtree
git subtree add --prefix=backendfapi backend main --squash
```

### Push thay đổi lên backend repo

```bash
# Commit các thay đổi trước
git add backendfapi/
git commit -m "chore: update backendfapi"

# Push subtree
git subtree push --prefix=backendfapi backend main
```

### Pull thay đổi từ backend repo

```bash
git subtree pull --prefix=backendfapi backend main --squash
```

## Cách 3: Thủ công (Nếu cần kiểm soát chi tiết)

### Bước 1: Commit các thay đổi hiện tại

```powershell
git add backendfapi/
git commit -m "chore: update backendfapi"
```

### Bước 2: Clone backend repository vào thư mục tạm

```powershell
git clone https://github.com/BaDai116/kumo_chuyende.git temp_backend
cd temp_backend
git checkout main
```

### Bước 3: Copy files từ backendfapi

```powershell
# Copy tất cả files (trừ .git)
Copy-Item -Path ..\backendfapi\* -Destination . -Recurse -Force -Exclude .git
```

### Bước 4: Commit và push

```powershell
git add -A
git commit -m "chore: sync from main repository"
git push origin main
```

### Bước 5: Dọn dẹp

```powershell
cd ..
Remove-Item -Path temp_backend -Recurse -Force
```

## Lưu ý quan trọng

1. **Luôn commit các thay đổi trước khi sync** để tránh mất dữ liệu
2. **Kiểm tra kỹ trước khi push** để đảm bảo không push nhầm code
3. **Backup trước khi pull** nếu có thay đổi quan trọng chưa commit
4. Repository backend có cấu trúc giống backendfapi nhưng ở root level (không có thư mục backendfapi)

## Troubleshooting

### Lỗi: "remote backend already exists"
- Remote đã được cấu hình, không cần làm gì thêm

### Lỗi: "authentication failed"
- Kiểm tra quyền truy cập GitHub
- Có thể cần cấu hình SSH key hoặc Personal Access Token

### Lỗi: "merge conflicts"
- Giải quyết conflicts thủ công
- Hoặc sử dụng `git subtree pull` với `--squash` để tránh conflicts

## Liên hệ

Nếu gặp vấn đề, hãy kiểm tra:
- Git remote: `git remote -v`
- Trạng thái: `git status`
- Log: `git log --oneline -10`
