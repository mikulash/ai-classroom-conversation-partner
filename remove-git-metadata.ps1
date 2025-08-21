param(
    [switch]$IncludeGitFiles,   # Also remove .gitignore and .gitattributes when set
    [switch]$DryRun,            # Show what would be removed without deleting
    [switch]$Force              # Do not prompt for confirmation
)

$root = Get-Location
Write-Host "Scanning for Git metadata under: $root" -ForegroundColor Cyan

# Find all .git directories (including the root one)
$gitDirs = Get-ChildItem -Path $root -Directory -Recurse -Force | Where-Object { $_.Name -eq '.git' }

if ($gitDirs.Count -eq 0) {
    Write-Host "No .git directories found." -ForegroundColor Green
} else {
    Write-Host "Found $($gitDirs.Count) .git directories." -ForegroundColor Yellow
    foreach ($dir in $gitDirs) {
        Write-Host ("{0} {1}" -f ($DryRun ? '[DryRun] Would remove' : 'Removing'), $dir.FullName) -ForegroundColor Red
        if (-not $DryRun) {
            if ($Force -or $PSCmdlet.ShouldContinue("Delete .git directory:
$($dir.FullName)", "Confirm deletion")) {
                try {
                    Remove-Item -Path $dir.FullName -Recurse -Force -ErrorAction Stop
                } catch {
                    Write-Warning "Failed to remove $($dir.FullName): $($_.Exception.Message)"
                }
            }
        }
    }
}

# Optionally remove .gitignore and .gitattributes files
if ($IncludeGitFiles) {
    $gitFiles = @('.gitignore', '.gitattributes')
    foreach ($pattern in $gitFiles) {
        $files = Get-ChildItem -Path $root -File -Recurse -Force | Where-Object { $_.Name -ieq $pattern }
        if ($files.Count -gt 0) {
            Write-Host "Found $($files.Count) $pattern files." -ForegroundColor Yellow
            foreach ($file in $files) {
                Write-Host ("{0} {1}" -f ($DryRun ? '[DryRun] Would remove' : 'Removing'), $file.FullName) -ForegroundColor Red
                if (-not $DryRun) {
                    if ($Force -or $PSCmdlet.ShouldContinue("Delete file:
$($file.FullName)", "Confirm deletion")) {
                        try {
                            Remove-Item -Path $file.FullName -Force -ErrorAction Stop
                        } catch {
                            Write-Warning "Failed to remove $($file.FullName): $($_.Exception.Message)"
                        }
                    }
                }
            }
        } else {
            Write-Host "No $pattern files found." -ForegroundColor Green
        }
    }
}

Write-Host "Git metadata cleanup complete." -ForegroundColor Cyan

<#!
USAGE EXAMPLES:

# Preview what would be deleted (no changes made):
PowerShell -ExecutionPolicy Bypass -File .\remove-git-metadata.ps1 -DryRun

# Remove all .git directories with confirmations:
PowerShell -ExecutionPolicy Bypass -File .\remove-git-metadata.ps1

# Remove all .git directories and also .gitignore/.gitattributes, no prompts:
PowerShell -ExecutionPolicy Bypass -File .\remove-git-metadata.ps1 -IncludeGitFiles -Force

After removing Git metadata, you can initialize a fresh repository:
  git init
  git add .
  git commit -m "Initial import"
  git remote add origin <new-remote-url>
  git push -u origin main
!#>
