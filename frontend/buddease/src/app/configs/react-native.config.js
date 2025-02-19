// react-native.config.js
module.exports = {
    dependencies: {
      // Add any additional dependencies required for your React Native project
      // For example:
      // 'react-native-maps': {
      //   platforms: {
      //     ios: null, // Disable this dependency on iOS
      //   },
      // },
    },
    assets: [
      // Add any additional asset directories or patterns required for your project
      // For example:
      // './assets/fonts',
      // './assets/images',
    ],
    commands: [
      // Define custom commands or overrides for default commands
      {
        name: 'custom:build-android',
        description: 'Custom build command for Android',
        func: async () => {
          // Add custom logic for building Android
          console.log('Building Android...');
          // Run your custom build command here
        },
      },
      {
        name: 'custom:build-ios',
        description: 'Custom build command for iOS',
        func: async () => {
          // Add custom logic for building iOS
          console.log('Building iOS...');
          // Run your custom build command here
        },
      },
    ],
    platforms: {
      // Override platform-specific settings or add custom platform configurations
      android: {
        // Add Android-specific settings or configurations
        packageName: 'com.example.app', // Change the default package name
        buildTypes: {
          release: {
            // Define release-specific settings
          },
          debug: {
            // Define debug-specific settings
          },
        },
      },
      ios: {
        // Add iOS-specific settings or configurations
        bundleIdentifier: 'com.example.app', // Change the default bundle identifier
        buildSettings: {
          // Define custom build settings for iOS
        },
      },
    },
  };
  

//   In this react-native.config.js file:

// dependencies: You can specify additional dependencies required for your React Native project, including any platform-specific dependencies.
// assets: You can add any additional asset directories or patterns required for your project, such as fonts or images.
// commands: You can define custom commands or overrides for default commands. These commands can be used to execute custom logic during the build process or perform other tasks.
// platforms: You can override platform-specific settings or add custom platform configurations for Android and iOS. This includes settings like package names, bundle identifiers, build types, and build settings.
// Feel free to customize the react-native.config.js file according to your project's specific requirements and platform configurations.