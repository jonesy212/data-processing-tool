// IosComponent.js

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import SharedButton from '../shared/SharedButton'; // Import shared component

const IosComponent = () => {
  // Handle any iOS-specific behaviors here

  return (
    <View style={styles.iosComponentContainer}>
      <Text style={styles.iosComponentText}>iOS Component</Text>

      {/* Utilize shared components */}
      <SharedButton text="Click me" />

      {/* Additional iOS-specific content */}
      <View style={styles.iosSpecificContainer}>
        <Text style={styles.iosSpecificText}>iOS-specific content</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  iosComponentContainer: {
    // Add iOS-specific styles using React Native StyleSheet
    backgroundColor: '#f0f8ff',
    padding: 20,
    borderWidth: 2,
    borderColor: '#6495ed',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  iosComponentText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  iosSpecificContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#ffefd5',
    borderRadius: 5,
  },
  iosSpecificText: {
    fontSize: 16,
    color: '#333',
  },
});

export default IosComponent;
