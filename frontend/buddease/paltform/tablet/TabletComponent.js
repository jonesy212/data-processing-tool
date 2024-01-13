// TabletComponent.js

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import SharedButton from '../shared/SharedButton'; // Import shared component

const TabletComponent = () => {
  // Implement tablet-specific behaviors here

  return (
    <View style={styles.tabletComponentContainer}>
      <Text style={styles.tabletComponentText}>Tablet Component</Text>

      {/* Utilize shared components */}
      <SharedButton text="Click me" />

      {/* Additional tablet-specific content */}
      <View style={styles.tabletSpecificContainer}>
        <Text style={styles.tabletSpecificText}>Tablet-specific content</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabletComponentContainer: {
    // Add tablet-specific styles using React Native StyleSheet
    backgroundColor: '#d3d3d3',
    padding: 20,
    borderWidth: 2,
    borderColor: '#808080',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  tabletComponentText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tabletSpecificContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#d8bfd8',
    borderRadius: 5,
  },
  tabletSpecificText: {
    fontSize: 16,
    color: '#333',
  },
});

export default TabletComponent;
