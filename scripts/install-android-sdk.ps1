# Android SDK Installation Script for Windows
# Run this in PowerShell as Administrator

Write-Host "🤖 Installing Android SDK Command Line Tools..." -ForegroundColor Green

# Create Android directory
$androidDir = "C:\Android"
$cmdlineToolsDir = "$androidDir\cmdline-tools"
$latestDir = "$cmdlineToolsDir\latest"

Write-Host "📁 Creating directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $androidDir | Out-Null
New-Item -ItemType Directory -Force -Path $cmdlineToolsDir | Out-Null

# Download URL for Windows
$downloadUrl = "https://dl.google.com/android/repository/commandlinetools-win-9477386_latest.zip"
$zipFile = "$env:TEMP\commandlinetools-win-latest.zip"

Write-Host "📥 Downloading Android Command Line Tools..." -ForegroundColor Yellow
Write-Host "   URL: $downloadUrl" -ForegroundColor Gray

try {
    # Download the file
    Invoke-WebRequest -Uri $downloadUrl -OutFile $zipFile -UseBasicParsing
    Write-Host "✅ Download completed!" -ForegroundColor Green
    
    # Extract the zip file
    Write-Host "📦 Extracting files..." -ForegroundColor Yellow
    Expand-Archive -Path $zipFile -DestinationPath $cmdlineToolsDir -Force
    
    # Move cmdline-tools contents to 'latest' folder
    $extractedDir = "$cmdlineToolsDir\cmdline-tools"
    if (Test-Path $extractedDir) {
        Move-Item -Path "$extractedDir\*" -Destination $latestDir -Force
        Remove-Item -Path $extractedDir -Force
    }
    
    Write-Host "✅ Extraction completed!" -ForegroundColor Green
    
    # Clean up
    Remove-Item -Path $zipFile -Force
    
} catch {
    Write-Host "❌ Error downloading/extracting: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Set environment variables
Write-Host "🔧 Setting environment variables..." -ForegroundColor Yellow

$env:ANDROID_HOME = $androidDir
$env:ANDROID_SDK_ROOT = $androidDir

# Set permanent environment variables
[Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidDir, "User")
[Environment]::SetEnvironmentVariable("ANDROID_SDK_ROOT", $androidDir, "User")

# Update PATH
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
$pathsToAdd = @(
    "$androidDir\cmdline-tools\latest\bin",
    "$androidDir\platform-tools",
    "$androidDir\tools"
)

foreach ($pathToAdd in $pathsToAdd) {
    if ($currentPath -notlike "*$pathToAdd*") {
        $currentPath += ";$pathToAdd"
    }
}

[Environment]::SetEnvironmentVariable("PATH", $currentPath, "User")

Write-Host "✅ Environment variables set!" -ForegroundColor Green

# Install required SDK packages
Write-Host "📦 Installing required SDK packages..." -ForegroundColor Yellow

$sdkmanager = "$latestDir\bin\sdkmanager.bat"

if (Test-Path $sdkmanager) {
    Write-Host "   Installing platform-tools..." -ForegroundColor Gray
    & $sdkmanager "platform-tools"
    
    Write-Host "   Installing Android 33 platform..." -ForegroundColor Gray
    & $sdkmanager "platforms;android-33"
    
    Write-Host "   Installing build tools..." -ForegroundColor Gray
    & $sdkmanager "build-tools;33.0.0"
    
    Write-Host "✅ SDK packages installed!" -ForegroundColor Green
} else {
    Write-Host "❌ SDK Manager not found at: $sdkmanager" -ForegroundColor Red
}

Write-Host "`n🎉 Android SDK installation completed!" -ForegroundColor Green
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "   ANDROID_HOME: $androidDir" -ForegroundColor Gray
Write-Host "   SDK Manager: $sdkmanager" -ForegroundColor Gray
Write-Host "   Platform Tools: $androidDir\platform-tools" -ForegroundColor Gray

Write-Host "`n⚠️  IMPORTANT: Please restart your terminal/IDE for changes to take effect!" -ForegroundColor Yellow
Write-Host "`n🧪 Test your installation with:" -ForegroundColor Cyan
Write-Host "   adb version" -ForegroundColor Gray
Write-Host "   sdkmanager --list" -ForegroundColor Gray