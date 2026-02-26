# download-python-embed.ps1
# Downloads Python Embeddable and prepares resources for Tauri bundling

$ErrorActionPreference = "Stop"

$PYTHON_VERSION = "3.12.8"
$PYTHON_ZIP = "python-${PYTHON_VERSION}-embed-amd64.zip"
$PYTHON_URL = "https://www.python.org/ftp/python/${PYTHON_VERSION}/${PYTHON_ZIP}"
$GET_PIP_URL = "https://bootstrap.pypa.io/get-pip.py"

$PROJECT_ROOT = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$RESOURCES_DIR = Join-Path (Join-Path $PROJECT_ROOT "src-tauri") "resources"
$PYTHON_EMBED_DIR = Join-Path $RESOURCES_DIR "python-embed"
$PYTHON_SERVER_DEST = Join-Path $RESOURCES_DIR "python-server"

Write-Host "=== Python Embeddable Download Script ===" -ForegroundColor Cyan
Write-Host "Python version: $PYTHON_VERSION"
Write-Host "Resources dir: $RESOURCES_DIR"

# Create resources directory
if (!(Test-Path $RESOURCES_DIR)) {
    New-Item -ItemType Directory -Path $RESOURCES_DIR -Force | Out-Null
}

# Step 1: Download and extract Python Embeddable
Write-Host "`n[1/4] Downloading Python Embeddable..." -ForegroundColor Yellow
$zipPath = Join-Path $RESOURCES_DIR $PYTHON_ZIP

if (!(Test-Path $PYTHON_EMBED_DIR)) {
    if (!(Test-Path $zipPath)) {
        Invoke-WebRequest -Uri $PYTHON_URL -OutFile $zipPath
        Write-Host "  Downloaded: $PYTHON_ZIP"
    } else {
        Write-Host "  ZIP already exists, skipping download"
    }

    New-Item -ItemType Directory -Path $PYTHON_EMBED_DIR -Force | Out-Null
    Expand-Archive -Path $zipPath -DestinationPath $PYTHON_EMBED_DIR -Force
    Write-Host "  Extracted to: $PYTHON_EMBED_DIR"

    # Clean up zip
    Remove-Item $zipPath -Force
    Write-Host "  Cleaned up ZIP file"
} else {
    Write-Host "  Python embed directory already exists, skipping"
}

# Step 2: Fix python312._pth to enable import site
Write-Host "`n[2/4] Fixing python312._pth..." -ForegroundColor Yellow
$pthFile = Join-Path $PYTHON_EMBED_DIR "python312._pth"
if (Test-Path $pthFile) {
    $content = Get-Content $pthFile -Raw
    $content = $content -replace "#import site", "import site"
    Set-Content -Path $pthFile -Value $content -NoNewline
    Write-Host "  Uncommented 'import site' in python312._pth"
} else {
    Write-Host "  WARNING: python312._pth not found!" -ForegroundColor Red
}

# Step 3: Download get-pip.py
Write-Host "`n[3/4] Downloading get-pip.py..." -ForegroundColor Yellow
$getPipPath = Join-Path $RESOURCES_DIR "get-pip.py"
if (!(Test-Path $getPipPath)) {
    Invoke-WebRequest -Uri $GET_PIP_URL -OutFile $getPipPath
    Write-Host "  Downloaded get-pip.py"
} else {
    Write-Host "  get-pip.py already exists, skipping"
}

# Step 4: Copy python-server files
Write-Host "`n[4/4] Copying python-server files..." -ForegroundColor Yellow
$pythonServerSrc = Join-Path $PROJECT_ROOT "python-server"
if (Test-Path $pythonServerSrc) {
    if (Test-Path $PYTHON_SERVER_DEST) {
        Remove-Item $PYTHON_SERVER_DEST -Recurse -Force
    }
    New-Item -ItemType Directory -Path $PYTHON_SERVER_DEST -Force | Out-Null

    # Copy .py files and requirements.txt
    Get-ChildItem -Path $pythonServerSrc -Filter "*.py" | Copy-Item -Destination $PYTHON_SERVER_DEST
    $reqFile = Join-Path $pythonServerSrc "requirements.txt"
    if (Test-Path $reqFile) {
        Copy-Item $reqFile -Destination $PYTHON_SERVER_DEST
    }
    Write-Host "  Copied python-server files to resources"
} else {
    Write-Host "  WARNING: python-server/ directory not found!" -ForegroundColor Red
}

Write-Host "`n=== Done! ===" -ForegroundColor Green
Write-Host "Resources prepared in: $RESOURCES_DIR"
Write-Host "  - python-embed/ (Python $PYTHON_VERSION embeddable)"
Write-Host "  - get-pip.py"
Write-Host "  - python-server/"
