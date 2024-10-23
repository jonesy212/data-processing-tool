import React from 'react';
import { Platform, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { AnimationType, useAnimationHook } from '../libraries/animations/AnimationLibrary';
import { useShakeAnimation } from '../libraries/animations/useShakeAnimation';

interface FormElementStylesProps {
  animationType: AnimationType;
}

const FormElementStyles: React.FC<FormElementStylesProps> = async ({
  animationType,
}) => {
  const { shakeAnimation, startShakeAnimation } = useShakeAnimation(); // Use the custom hook for shake animation

 
  React.useEffect(() => {
    if (animationType === "shake") {
      startShakeAnimation();
    }
    if (Platform.OS === 'android') {
      startShakeAnimation();
    }
    if (Platform.OS === 'ios') {
      startShakeAnimation();
    }
    
  })
  // Dynamic styles based on animation type
const inputContainerStyle: (ViewStyle & { animationName?: string })[] = [
  styles.inputContainer,
  animationType === "shake" // Update the comparison to use string literals instead of enum values
    ? { transform: [{ translateX: shakeAnimation }] }
    : {},
  animationType === "pulse" // Update the comparison to use string literals instead of enum values
    ? {
        transform: [
          {
            scale: shakeAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.1],
            }),
          },
        ],
      }
    : {},
];
  
  
  

const animationLibrary = await useAnimationHook({ library: "gsap", animationType });
if (animationLibrary) {
  if (animationLibrary instanceof Promise) {
    // Animation library is still loading, handle accordingly
  } else {
    if (animationLibrary.shake) {
      inputContainerStyle.push({ animationName: animationLibrary.shake.name });
    }
  }
}


// Add animation name to inputContainerStyle if available
if (animationLibrary?.shake?.name) {
  inputContainerStyle.push({ animationName: animationLibrary.shake.name });
}


  return (
    <View style={styles.container}>
      <Text style={styles.label}>Username</Text>
      <View style={inputContainerStyle} onTouchStart={startShakeAnimation}>
        {/* Input component goes here */}
      </View>
      <Text style={styles.label}>Password</Text>
      <View style={inputContainerStyle} onTouchStart={startShakeAnimation}>
        {/* Input component goes here */}
      </View>
      {/* Add more form elements as needed */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingVertical: Platform.OS === 'ios' ? 10 : 5, // Adjust padding for iOS
    paddingHorizontal: 10,
    marginBottom: 10,
  },
});

export default FormElementStyles;
