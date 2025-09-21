# 📱 Build and Install APK on Your Phone

## 🚀 Method 1: Expo Go App (Fastest - No Build Required)

This is the quickest way to test your app on your phone:

### Step 1: Install Expo Go
1. Go to Google Play Store on your phone
2. Search for "Expo Go"
3. Install the Expo Go app

### Step 2: Start Development Server
```bash
npm run dev:all
```

### Step 3: Connect Your Phone
1. Make sure your phone and computer are on the same WiFi network
2. Open Expo Go app on your phone
3. Scan the QR code that appears in your terminal/browser
4. Your app will load directly on your phone!

---

## 🔨 Method 2: Build APK with EAS Build (Recommended)

This creates a standalone APK file you can install:

### Step 1: Install EAS CLI
```bash
npm install -g @expo/eas-cli
```

### Step 2: Login to Expo
```bash
eas login
```

### Step 3: Configure EAS Build
```bash
eas build:configure
```

### Step 4: Build APK
```bash
# Build for Android (APK)
eas build --platform android --profile preview

# Or build AAB for Play Store
eas build --platform android --profile production
```

### Step 5: Download and Install
1. EAS will provide a download link when build completes
2. Download the APK to your phone
3. Enable "Install from unknown sources" in Android settings
4. Install the APK

---

## 🛠️ Method 3: Local Build (Requires Android SDK)

First, make sure Android SDK is installed, then:

### Step 1: Install Android SDK
```bash
npm run install:android
```

### Step 2: Build Locally
```bash
# Build for development
npx expo run:android

# Or build APK manually
npx expo build:android --type apk
```

---

## 📋 Quick Setup Scripts

Let me create some helpful scripts for you: