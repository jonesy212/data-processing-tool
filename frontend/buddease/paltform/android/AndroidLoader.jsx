// AndroidLoader.jsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const AndroidLoader = () => {
  return (
    <View style={styles.android-loader}>
      <Text>Android Loader</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  androidLoader: {
    /* Add Android-specific loader styles using React Native StyleSheet */
  },
});

export default AndroidLoader;
