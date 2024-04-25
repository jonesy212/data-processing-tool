import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import AnimationTypeEnum, { AnimationType, useAnimationHook } from '../libraries/animations/AnimationLibrary';

const FormElementStyles = ({
  animationType,
}: {
  animationType: AnimationType;
}) => {
  // Use the animation hook to get the appropriate animation library
  const animationLibrary = useAnimationHook({ library: "gsap", animationType });

    // Define animated values for shake animation
    const shakeAnimation = new Animated.Value(0);

    // Define shake animation
    const startShakeAnimation = () => {
      Animated.sequence([
        Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    };
  
  // Dynamic styles based on animation type
  const inputContainerStyle = [
    styles.inputContainer,
    animationType === "shake" as string ? { transform: [{ translateX: shakeAnimation }] } : null,
    animationType === "pulse" as string ? { 
      transform: [{ scale: shakeAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.1]
      }) }]
    } : null
    
    // Add more animation styles as needed
  ];
  

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Username</Text>
      <View style={inputContainerStyle}>{/* Input component goes here */}</View>
      <Text style={styles.label}>Password</Text>
      <View style={inputContainerStyle}>{/* Input component goes here */}</View>
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
  // Define animation styles
  shakeAnimation: {
    animationName: 'shake',
    animationDuration: '0.5s',
    animationIterationCount: 'infinite',
  },
  pulseAnimation: {
    animationName: 'pulse',
    animationDuration: '1s',
    animationIterationCount: 'infinite',
  },
  // Add more animation styles as needed
});

export default FormElementStyles;
