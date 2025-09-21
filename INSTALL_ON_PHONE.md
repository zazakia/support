# 📱 Install RepairShop Pro on Your Phone

## 🚀 Quick Start (Recommended)

### Option 1: Expo Go (Instant Testing)
```bash
# 1. Install Expo Go app from Play Store
# 2. Run this command:
npm run build:apk
# 3. Choose option 1
# 4. Scan QR code with Expo Go app
```

### Option 2: Build APK File
```bash
# 1. Run the build script:
npm run build:apk
# 2. Choose option 2 (EAS Build)
# 3. Follow the prompts to login
# 4. Wait for build to complete
# 5. Download and install APK
```

## 📋 Detailed Steps

### Method 1: Expo Go (No Build Required)

**Step 1: Install Expo Go**
- Open Google Play Store on your phone
- Search for "Expo Go" 
- Install the app

**Step 2: Start Development Server**
```bash
npm run dev:all
```

**Step 3: Connect Your Phone**
- Make sure phone and computer are on same WiFi
- Open Expo Go app
- Tap "Scan QR Code"
- Scan the QR code from your terminal/browser
- App loads instantly! 🎉

### Method 2: Build Standalone APK

**Step 1: Install EAS CLI**
```bash
npm install -g @expo/eas-cli
```

**Step 2: Login to Expo**
```bash
eas login
```
(Create free account at expo.dev if needed)

**Step 3: Build APK**
```bash
npm run build:android
```

**Step 4: Install on Phone**
- EAS will email you a download link
- Download APK on your phone
- Enable "Install from unknown sources" in Android settings
- Install the APK file

## 🔧 Troubleshooting

### "Unknown sources" not allowed
1. Go to Settings → Security
2. Enable "Unknown sources" or "Install unknown apps"
3. Try installing APK again

### WiFi connection issues
- Make sure both devices are on same network
- Try restarting the development server
- Check firewall settings

### Build fails
- Make sure you're logged into Expo
- Check internet connection
- Try clearing cache: `npm run clear:cache`

## 📱 App Features on Phone

Once installed, you can test:
- ✅ Login with demo users
- ✅ Create repair jobs
- ✅ View job listings
- ✅ Customer management
- ✅ Real-time form validation
- ✅ Offline functionality
- ✅ Toast notifications
- ✅ Loading states

## 🎯 Demo Users

Test the app with these accounts:
- **Customer**: john.customer@email.com / demo123
- **Technician**: mike.tech@repairshop.com / demo123  
- **Admin**: sarah.admin@repairshop.com / demo123
- **Owner**: owner@repairshop.com / demo123

## 🚀 Next Steps

After testing on your phone:
1. Customize the app branding
2. Connect to real backend API
3. Add push notifications
4. Deploy to Play Store

Happy testing! 📱✨