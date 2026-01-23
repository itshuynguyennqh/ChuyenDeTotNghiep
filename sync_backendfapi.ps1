# Script để sync thư mục backendfapi với backend repository
# Sử dụng: .\sync_backendfapi.ps1

param(
    [switch]$Push,
    [switch]$Pull,
    [switch]$Status
)

$BackendfapiPath = "backendfapi"
$BackendRemote = "backend"
$BackendBranch = "main"
$TempDir = "temp_backend_sync"

function Show-Status {
    Write-Host "=== Kiểm tra trạng thái ===" -ForegroundColor Cyan
    Write-Host "Remote backend: $BackendRemote" -ForegroundColor Yellow
    Write-Host "Branch: $BackendBranch" -ForegroundColor Yellow
    
    # Fetch latest từ backend
    Write-Host "`nĐang fetch từ backend remote..." -ForegroundColor Green
    git fetch $BackendRemote
    
    # So sánh các file
    Write-Host "`nĐang so sánh các file..." -ForegroundColor Green
    $localFiles = Get-ChildItem -Path $BackendfapiPath -Recurse -File | Where-Object { 
        $_.FullName -notmatch '\.git' -and $_.FullName -notmatch '__pycache__' 
    }
    
    Write-Host "`nTìm thấy $($localFiles.Count) file trong backendfapi" -ForegroundColor Yellow
}

function Sync-ToBackend {
    Write-Host "=== Đồng bộ backendfapi lên backend repository ===" -ForegroundColor Cyan
    
    # Kiểm tra có thay đổi chưa commit không
    $uncommitted = git status --porcelain | Select-String "backendfapi"
    if ($uncommitted) {
        Write-Host "`nCẢNH BÁO: Có thay đổi chưa commit trong backendfapi!" -ForegroundColor Red
        Write-Host "Bạn có muốn commit trước khi sync không? (y/n)" -ForegroundColor Yellow
        $response = Read-Host
        if ($response -eq 'y' -or $response -eq 'Y') {
            Write-Host "Đang commit các thay đổi..." -ForegroundColor Green
            git add backendfapi/
            git commit -m "chore: update backendfapi before sync"
        } else {
            Write-Host "Hủy bỏ sync." -ForegroundColor Red
            return
        }
    }
    
    # Fetch latest
    Write-Host "`nĐang fetch từ backend remote..." -ForegroundColor Green
    git fetch $BackendRemote
    
    # Tạo thư mục tạm để clone backend repo
    if (Test-Path $TempDir) {
        Remove-Item -Path $TempDir -Recurse -Force
    }
    
    Write-Host "`nĐang clone backend repository vào thư mục tạm..." -ForegroundColor Green
    git clone -b $BackendBranch https://github.com/BaDai116/kumo_chuyende.git $TempDir
    
    if (-not (Test-Path $TempDir)) {
        Write-Host "Lỗi: Không thể clone backend repository!" -ForegroundColor Red
        return
    }
    
    Write-Host "`nĐang copy files từ backendfapi sang backend repo..." -ForegroundColor Green
    
    # Copy tất cả files từ backendfapi (trừ .git)
    Get-ChildItem -Path $BackendfapiPath -Recurse | ForEach-Object {
        $relativePath = $_.FullName.Substring((Resolve-Path $BackendfapiPath).Path.Length + 1)
        $destPath = Join-Path $TempDir $relativePath
        
        if ($_.PSIsContainer) {
            if (-not (Test-Path $destPath)) {
                New-Item -ItemType Directory -Path $destPath -Force | Out-Null
            }
        } else {
            $destDir = Split-Path $destPath -Parent
            if (-not (Test-Path $destDir)) {
                New-Item -ItemType Directory -Path $destDir -Force | Out-Null
            }
            Copy-Item -Path $_.FullName -Destination $destPath -Force
        }
    }
    
    # Commit và push
    Push-Location $TempDir
    try {
        Write-Host "`nĐang kiểm tra thay đổi trong backend repo..." -ForegroundColor Green
        git add -A
        $statusOutput = git status --porcelain | Out-String
        
        if ($statusOutput.Trim().Length -gt 0) {
            Write-Host "`nCác file đã thay đổi:" -ForegroundColor Yellow
            git status --short
            
            Write-Host "`nBạn có muốn commit và push lên backend repository không? (y/n)" -ForegroundColor Yellow
            $response = Read-Host
            if ($response -eq 'y' -or $response -eq 'Y') {
                Write-Host "`nNhập commit message (hoặc Enter để dùng message mặc định):" -ForegroundColor Yellow
                $commitMsg = Read-Host
                if ([string]::IsNullOrWhiteSpace($commitMsg)) {
                    $commitMsg = "chore: sync backendfapi from main repository"
                }
                
                git commit -m $commitMsg
                Write-Host "`nĐang push lên backend repository..." -ForegroundColor Green
                git push origin $BackendBranch
                Write-Host "`n✓ Đã push thành công lên backend repository!" -ForegroundColor Green
            } else {
                Write-Host "Hủy bỏ push." -ForegroundColor Yellow
            }
        } else {
            Write-Host "`nKhông có thay đổi nào để push." -ForegroundColor Yellow
        }
    } finally {
        Pop-Location
        # Xóa thư mục tạm
        if (Test-Path $TempDir) {
            Remove-Item -Path $TempDir -Recurse -Force
            Write-Host "`nĐã dọn dẹp thư mục tạm." -ForegroundColor Green
        }
    }
}

function Sync-FromBackend {
    Write-Host "=== Đồng bộ từ backend repository về backendfapi ===" -ForegroundColor Cyan
    
    # Fetch latest
    Write-Host "Đang fetch từ backend remote..." -ForegroundColor Green
    git fetch $BackendRemote
    
    # Tạo thư mục tạm để clone backend repo
    if (Test-Path $TempDir) {
        Remove-Item -Path $TempDir -Recurse -Force
    }
    
    Write-Host "Đang clone backend repository vào thư mục tạm..." -ForegroundColor Green
    git clone -b $BackendBranch https://github.com/BaDai116/kumo_chuyende.git $TempDir
    
    if (-not (Test-Path $TempDir)) {
        Write-Host "Lỗi: Không thể clone backend repository!" -ForegroundColor Red
        return
    }
    
    Write-Host "`nCẢNH BÁO: Thao tác này sẽ ghi đè các file trong backendfapi!" -ForegroundColor Red
    Write-Host "Bạn có muốn tiếp tục không? (y/n)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -ne 'y' -and $response -ne 'Y') {
        Write-Host "Hủy bỏ sync." -ForegroundColor Yellow
        if (Test-Path $TempDir) {
            Remove-Item -Path $TempDir -Recurse -Force
        }
        return
    }
    
    Write-Host "`nĐang copy files từ backend repo sang backendfapi..." -ForegroundColor Green
    
    # Copy tất cả files từ temp dir (trừ .git)
    Get-ChildItem -Path $TempDir -Recurse | Where-Object { 
        $_.FullName -notmatch '\.git' 
    } | ForEach-Object {
        $relativePath = $_.FullName.Substring((Resolve-Path $TempDir).Path.Length + 1)
        $destPath = Join-Path $BackendfapiPath $relativePath
        
        if ($_.PSIsContainer) {
            if (-not (Test-Path $destPath)) {
                New-Item -ItemType Directory -Path $destPath -Force | Out-Null
            }
        } else {
            $destDir = Split-Path $destPath -Parent
            if (-not (Test-Path $destDir)) {
                New-Item -ItemType Directory -Path $destDir -Force | Out-Null
            }
            Copy-Item -Path $_.FullName -Destination $destPath -Force
        }
    }
    
    # Xóa thư mục tạm
    if (Test-Path $TempDir) {
        Remove-Item -Path $TempDir -Recurse -Force
    }
    
    Write-Host "`n✓ Đã sync thành công từ backend repository!" -ForegroundColor Green
    Write-Host "Hãy kiểm tra các thay đổi và commit nếu cần." -ForegroundColor Yellow
}

# Main execution
if ($Status) {
    Show-Status
} elseif ($Push) {
    Sync-ToBackend
} elseif ($Pull) {
    Sync-FromBackend
} else {
    Write-Host "=== Script đồng bộ backendfapi với backend repository ===" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Cách sử dụng:" -ForegroundColor Yellow
    Write-Host "  .\sync_backendfapi.ps1 -Push    : Push backendfapi lên backend repository"
    Write-Host "  .\sync_backendfapi.ps1 -Pull    : Pull từ backend repository về backendfapi"
    Write-Host "  .\sync_backendfapi.ps1 -Status  : Kiểm tra trạng thái"
    Write-Host ""
    Write-Host "Ví dụ:" -ForegroundColor Yellow
    Write-Host "  .\sync_backendfapi.ps1 -Push"
}
