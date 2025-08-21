# Define the directories and file patterns to remove
$dirsToRemove = @('dist', 'node_modules', '.turbo', '.vercel', 'target')
$filesToRemove = @('*.tsbuildinfo')

# Get the current location
$currentLocation = Get-Location
Write-Host "Cleaning project at: $currentLocation" -ForegroundColor Cyan

# Remove directories
foreach ($dir in $dirsToRemove) {
    Write-Host "Searching for $dir directories..." -ForegroundColor Yellow
    $foundDirs = Get-ChildItem -Path $currentLocation -Directory -Recurse -Force |
                Where-Object { $_.Name -eq $dir }

    if ($foundDirs.Count -gt 0) {
        Write-Host "Found $($foundDirs.Count) $dir directories to remove" -ForegroundColor Yellow
        foreach ($foundDir in $foundDirs) {
            Write-Host "Removing: $($foundDir.FullName)" -ForegroundColor Red
            Remove-Item -Path $foundDir.FullName -Recurse -Force
        }
    } else {
        Write-Host "No $dir directories found" -ForegroundColor Green
    }
}

# Remove files ending with tsbuildinfo
foreach ($filePattern in $filesToRemove) {
    Write-Host "Searching for $filePattern files..." -ForegroundColor Yellow
    $foundFiles = Get-ChildItem -Path $currentLocation -File -Recurse -Force |
                 Where-Object { $_.Name -like $filePattern }

    if ($foundFiles.Count -gt 0) {
        Write-Host "Found $($foundFiles.Count) $filePattern files to remove" -ForegroundColor Yellow
        foreach ($foundFile in $foundFiles) {
            Write-Host "Removing: $($foundFile.FullName)" -ForegroundColor Red
            Remove-Item -Path $foundFile.FullName -Force
        }
    } else {
        Write-Host "No $filePattern files found" -ForegroundColor Green
    }
}

Write-Host "Cleanup complete!" -ForegroundColor Cyan
