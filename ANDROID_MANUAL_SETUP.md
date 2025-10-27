# Manual Android SDK Setup (Command Line Tools)

## 📥 Step 1: Download Command Line Tools

1. Go to: https://developer.android.com/studio#command-tools
2. Scroll down to "Command line tools only"
3. Download: `commandlinetools-win-9477386_latest.zip`
4. Save it to your Downloads folder

## 📁 Step 2: Create Directory Structure

Open Command Prompt as Administrator and run:

```cmd
mkdir C:\Android
mkdir C:\Android\cmdline-tools
```

## 📦 Step 3: Extract Files

1. Extract the downloaded zip file
2. You'll see a folder called `cmdline-tools`
3. Move the contents to: `C:\Android\cmdline-tools\latest\`

Your structure should look like:
```
C:\Android\
└── cmdline-tools\
    └── latest\
        ├── bin\
        ├── lib\
        └── ...
```

## 🔧 Step 4: Set Environment Variables

### Option A: Using System Properties (GUI)
1. Right-click "This PC" → Properties
2. Click "Advanced system settings"
3. Click "Environment Variables"
4. Under "User variables", click "New":
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Android`
5. Click "New" again:
   - Variable name: `ANDROID_SDK_ROOT`
   - Variable value: `C:\Android`
6. Edit the "Path" variable and add:
   - `C:\Android\cmdline-tools\latest\bin`
   - `C:\Android\platform-tools`

### Option B: Using Command Line
```cmd
setx ANDROID_HOME "C:\Android"
setx ANDROID_SDK_ROOT "C:\Android"
setx PATH "%PATH%;C:\Android\cmdline-tools\latest\bin;C:\Android\platform-tools"
```

## 📦 Step 5: Install Required Packages

Open a new Command Prompt and run:

```cmd
sdkmanager "platform-tools"
sdkmanager "platforms;android-33"
sdkmanager "build-tools;33.0.0"
```

## ✅ Step 6: Verify Installation

Test with these commands:
```cmd
adb version
sdkmanager --list
```

You should see version information for both commands.

## 🚀 Step 7: Start Your App

Now you can run:
```cmd
npm run dev:all
```

The Android development should wor