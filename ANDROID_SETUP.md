# Android Development Setup Guide

## 🤖 Installing Android SDK on Windows

### Method 1: Android Studio (Recommended)

1. **Download Android Studio**
   - Go to https://developer.android.com/studio
   - Download Android Studio for Windows
   - Run the installer

2. **Install Android Studio**
   - Follow the setup wizard
   - Choose "Standard" installation
   - Let it download the Android SDK automatically

3. **Configure Environment Variables**
   ```cmd
   # Add these to your Windows Environment Variables:
   ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
   ANDROID_SDK_ROOT=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
   
   # Add to PATH:
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\tools
   %ANDROID_HOME%\tools\bin
   ```

4. **Verify Installation**
   ```cmd
   adb version
   ```

### Method 2: Command Line Tools Only (Lighter)

1. **Download SDK Command Line Tools**
   - Go to https://developer.android.com/studio#command-tools
   - Download "Command line tools only"
   - Extract to `C:\Android\cmdline-tools`

2. **Set Environment Variables**
   ```cmd
   ANDROID_HOME=C:\Android
   ANDROID_SDK_ROOT=C:\Android
   
   # Add to PATH:
   C:\Android\cmdline-tools\latest\bin
   C:\Android\platform-tools
   ```

3. **Install Required Packages**
   ```cmd
   sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0"
   ```

### Method 3: Chocolatey (Package Manager)

1. **Install Chocolatey** (if not installed)
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
   ```

2. **Install Android SDK**
   ```cmd
   choco install android-sdk
   ```

## 🔧 Quick Setup Script

Create a PowerShell script to automate the setup:

```powershell
# android-setup.ps1
Write-Host "🤖 Setting up Android Development Environment..." -ForegroundColor Green

# Check if Android Studio is installed
$androidStudioPath = "C:\Program Files\Android\Android Studio\bin\studio64.exe"
if (Test-Path $androidStudioPath) {
    Write-Host "✅ Android Studio found!" -ForegroundColor Green
} else {
    Write-Host "❌ Android Studio not found. Please install it first." -ForegroundColor Red
    Write-Host "📥 Download from: https://developer.android.com/studio" -ForegroundColor Yellow
    exit 1
}

# Set environment variables
$androidHome = "$env:LOCALAPPDATA\Android\Sdk"
if (Test-Path $androidHome) {
    Write-Host "✅ Android SDK found at: $androidHome" -ForegroundColor Green
    
    # Set environment variables
    [Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidHome, "User")
    [Environment]::SetEnvironmentVariable("ANDROID_SDK_ROOT", $androidHome, "User")
    
    # Add to PATH
    $currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
    $newPaths = @(
        "$androidHome\platform-tools",
        "$androidHome\tools",
        "$androidHome\tools\bin"
    )
    
    foreach ($newPath in $newPaths) {
        if ($currentPath -notlike "*$newPath*") {
            $currentPath += ";$newPath"
        }
    }
    
    [Environment]::SetEnvironmentVariable("PATH", $currentPath, "User")
    
    Write-Host "✅ Environment variables configured!" -ForegroundColor Green
    Write-Host "🔄 Please restart your terminal/IDE for changes to take effect." -ForegroundColor Yellow
} else {
    Write-Host "❌ Android SDK not found. Please run Android Studio first to install SDK." -ForegroundColor Red
}
```

## 🚀 Testing Your Setup

After installation, test with these commands:

```cmd
# Check ADB
adb version

# Check SDK Manager
sdkmanager --list

# Check if device/emulator is connected
adb devices
```

## 🔍 Troubleshooting

### Common Issues:

1. **"adb is not recognized"**
   - Environment variables not set correctly
   - Need to restart terminal/IDE
   - PATH not updated

2. **"Failed to resolve Android SDK path"**
   - ANDROID_HOME not set
   - SDK not installed in expected location

3. **Permission Issues**
   - Run terminal as Administrator
   - Check Windows Defender/Antivirus

### Quick Fixes:

```cmd
# Refresh environment variables (PowerShell)
refreshenv

# Or restart your terminal completely

# Check current environment variables
echo %ANDROID_HOME%
echo %PATH%
```

## 🎯 For This Project

Once Android SDK is installed, you can:

```bash
# Start full development server (web + mobile)
npm run dev:all

# Start web only (no Android needed)
npm run dev

# Start with cleared cache
npm run dev:clear
```

## 📱 Alternative: Use Expo Go App

If you don't want to install Android SDK:

1. Install Expo Go app on your Android phone
2. Run `npm run dev:all`
3. Scan QR code with Expo Go app
4. Develop directly on your phone

This way you can test on real device without SDK setup!