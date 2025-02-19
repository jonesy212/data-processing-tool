// LayoutCustomization.tsx
import React, { useState } from "react";
import { useLayout } from "../pages/layouts/LayoutContext";
import {
  AnimationLibrary,
  AnimationType,
  useAnimationHook,
} from "../components/libraries/animations/AnimationLibrary";

interface LayoutCustomizationProps {
  // Add any necessary props here
}

const LayoutCustomization: React.FC<LayoutCustomizationProps> = (
  {
    /* Add props here if needed */
  }
) => {
  const { setDynamicBackgroundColor, setDynamicEffect } = useLayout();
  const [selectedAnimationLibrary, setSelectedAnimationLibrary] =
    useState<AnimationLibrary>("gsap");
  const [selectedAnimationType, setSelectedAnimationType] =
    useState<AnimationType>("fade");

  const handleBackgroundColorChange = (color: string) => {
    setDynamicBackgroundColor(color);
  };

  const handleAddEffect = async () => {
    const animationOptions = {
      library: selectedAnimationLibrary,
      animationType: selectedAnimationType,
    };
    const animation = await useAnimationHook(animationOptions);
    // Apply animation logic here
  };

  const handleAnimationLibraryChange = (library: AnimationLibrary) => {
    setSelectedAnimationLibrary(library);
  };

  const handleAnimationTypeChange = (type: AnimationType) => {
    setSelectedAnimationType(type);
  };

  return (
    <div>
      <h3>Layout Customization</h3>
      <div>
        <label htmlFor="backgroundColor">Background Color:</label>
        <input
          type="color"
          id="backgroundColor"
          onChange={(e) => handleBackgroundColorChange(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="animationLibrary">Animation Library:</label>
        <select
          id="animationLibrary"
          value={selectedAnimationLibrary}
          onChange={(e) =>
            handleAnimationLibraryChange(e.target.value as AnimationLibrary)
          }
        >
          <option value="gsap">GSAP</option>
          <option value="animejs">Anime.js</option>
          <option value="react-spring">React Spring</option>
          {/* Add more animation libraries as needed */}
        </select>
      </div>
      <div>
        <label htmlFor="animationType">Animation Type:</label>
        <select
          id="animationType"
          value={selectedAnimationType}
          onChange={(e) =>
            handleAnimationTypeChange(e.target.value as AnimationType)
          }
        >
          <option value="fade">Fade</option>
          <option value="slide">Slide</option>
          <option value="zoom">Zoom</option>
          <option value="rotate">Rotate</option>
          <option value="bounce">Bounce</option>
          <option value="flip">Flip</option>
          <option value="fadeScale">FadeScale</option>
          <option value="scale">Scale</option>
          <option value="spin">Spin</option>
          <option value="colorChange">Color Change</option>
          <option value="shake">Shake</option>
          <option value="path">Path</option>
          <option value="swing">Swing</option>
          <option value="pulse">Pulse</option>
          <option value="typing">Typing</option>
          <option value="glow">Glow</option>
          <option value="wave">Wave</option>
        </select>
      </div>
      <div>
        <button onClick={handleAddEffect}>Add Effect</button>
      </div>
    </div>
  );
};

export default LayoutCustomization;
