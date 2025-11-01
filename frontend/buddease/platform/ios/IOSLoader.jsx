// IOSLoader.jsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const IOSLoader = () => {
  return (
    <View style={styles.ios-loader}>
      <Text>IOS Loader</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  iosLoader: {
    /* Add iOS-specific loader styles using React Native StyleSheet */
  },
});

export default IOSLoader;
