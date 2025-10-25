# Mobile App Development Guide

This guide covers how to develop and deploy the Music BeReal app as a mobile application using Capacitor.

## Prerequisites

### For iOS Development
- macOS with Xcode installed
- iOS Simulator or physical iOS device
- Apple Developer account (for device testing and App Store deployment)

### For Android Development
- Android Studio installed
- Android SDK and emulator set up
- Physical Android device (optional)

## Quick Start

### 1. Build and Sync
```bash
npm run mobile:build
```

This command builds the web app and syncs it with both iOS and Android projects.

### 2. Run on Android
```bash
npm run cap:run:android
```

This will open Android Studio and you can run the app on an emulator or connected device.

### 3. Run on iOS
```bash
npm run cap:run:ios
```

This will open Xcode and you can run the app on the iOS Simulator or a connected device.

## Development Workflow

### 1. Make changes to your React app
Edit files in the `src/` directory as usual.

### 2. Test in browser first
```bash
npm run dev
```

### 3. Build and test on mobile
```bash
npm run mobile:build
npm run cap:run:android  # or cap:run:ios
```

### 4. Debug mobile-specific issues
- Use Chrome DevTools for Android: `chrome://inspect`
- Use Safari DevTools for iOS: Develop menu > Device name

## Available Scripts

- `npm run mobile:build` - Build web app and sync with mobile projects
- `npm run mobile:dev` - Build, sync, and run on Android in one command
- `npm run cap:sync` - Sync web app with mobile projects
- `npm run cap:run:ios` - Run on iOS
- `npm run cap:run:android` - Run on Android
- `npm run cap:open:ios` - Open iOS project in Xcode
- `npm run cap:open:android` - Open Android project in Android Studio

## Mobile Features Included

### Core Capacitor Plugins
- **Preferences**: Secure storage for auth tokens and user data
- **Push Notifications**: Native push notification support
- **Splash Screen**: Custom splash screen with app branding
- **Status Bar**: Control over the device status bar
- **Keyboard**: Better keyboard handling and resizing
- **App**: App lifecycle management and deep linking support

### Mobile-Specific Behaviors
- Automatic splash screen handling
- Proper status bar styling
- Keyboard resize behavior for better UX
- Android back button handling
- App state change detection
- Deep linking support (ready for implementation)

## Customization

### App Icon and Splash Screen
1. Replace images in:
   - `android/app/src/main/res/` (Android icons)
   - `ios/App/App/Assets.xcassets/` (iOS icons)
2. Run `npm run cap:sync` to update

### App Configuration
Edit `capacitor.config.ts` to modify:
- App ID and name
- Plugin configurations
- Server settings
- Platform-specific settings

### Native Code
- Android: Open with `npm run cap:open:android`
- iOS: Open with `npm run cap:open:ios`

## Publishing

### Android (Google Play Store)
1. Build signed APK/AAB in Android Studio
2. Upload to Google Play Console
3. Follow Google Play publishing guidelines

### iOS (App Store)
1. Archive app in Xcode
2. Upload to App Store Connect
3. Submit for review through App Store Connect

## Troubleshooting

### Common Issues
1. **Build errors**: Make sure you've run `npm run build` before syncing
2. **Plugin not found**: Run `npm run cap:sync` after installing new plugins
3. **iOS simulator issues**: Reset simulator or try different device
4. **Android build issues**: Clean and rebuild in Android Studio

### Getting Help
- Capacitor docs: https://capacitorjs.com/docs
- Troubleshooting: https://capacitorjs.com/docs/troubleshooting
- Community: https://github.com/ionic-team/capacitor/discussions