import { IconName, Library, library } from '@fortawesome/fontawesome-svg-core';
import { IconDefinition, faCircle, faCoffee, faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as FAIcon } from '@fortawesome/react-fontawesome';
import React from "react";

// Add more icons as needed
library.add(faCoffee, faStar, faCircle);

export const getFAIcon = (icon: IconName) => {
  // Return the FontAwesome icon component
  return <FAIcon icon={icon} />;
};

interface CustomLibrary extends Library {
  definitions: { [key: string]: IconDefinition };
}

export const loadFontAwesomeIcon = async (
    options: { icon: IconName },
    getIcon: (icon: IconName) => JSX.Element) => {
  const { icon } = options;
  // Check if the icon is already loaded in the library
  if (!(library as CustomLibrary).definitions[icon]) {
    // Load the icon dynamically
    const module = await import(`@fortawesome/free-solid-svg-icons/${icon}`);
    library.add(module.definition as IconDefinition);
  }

  // Return the FontAwesome icon component
  return getIcon(icon);
};
