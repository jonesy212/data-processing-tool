// AndroidComponent.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SharedButton from '../shared/SharedButton';  // Import shared component

const AndroidComponent = () => {
  // Handle any Android-specific behaviors here

  return (
    <View style={styles.androidComponentContainer}>
      <Text style={styles.androidComponentText}>Android Component</Text>

      {/* Utilize shared components */}
      <SharedButton text="Click me" />

      {/* Additional Android-specific content */}
      <View style={styles.androidSpecificContainer}>
        <Text style={styles.androidSpecificText}>Android-specific content</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  androidComponentContainer: {
    // Add Android-specific styles using React Native StyleSheet
    backgroundColor: '#e0e0e0',
    padding: 20,
    borderWidth: 2,
    borderColor: '#999',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  androidComponentText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  androidSpecificContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#ffcc00',
    borderRadius: 5,
  },
  androidSpecificText: {
    fontSize: 16,
    color: '#333',
  },
});

export default AndroidComponent;
