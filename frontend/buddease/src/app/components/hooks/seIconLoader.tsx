// useIconLoader.ts
import { useEffect, useState } from "react";
import { FontAwesomeIcon, getFAIcon, loadFontAwesomeIcon } from "../icons/fontAwesomeIconLoader";
import { loadIconLibrary } from "../icons/iconLibraryLoader";

type IconLibrary = "feather" | "ionicons" | "material-icons" | "font-awesome";
type IconOptions = { library: IconLibrary; icon: string };



export const useIconLoader = (
  options: IconOptions
): Promise<React.ReactNode> => {
  const [iconLibrary, setIconLibrary] = useState<any | null>(null);

  const loadIconLibraryAsync = async () => {
    const library = await loadIconLibrary(options.library);
    setIconLibrary(library);
  };

  useEffect(() => {
    loadIconLibraryAsync();
  }, [options.library]);

  const loadIcon = async (): Promise<React.ReactNode | null> => {
    switch (options.library) {
      case "feather":
      case "ionicons":
      case "material-icons":
        // Add your logic to load icons for other libraries
        break;
      case "font-awesome":
        try {
          const icon = await loadFontAwesomeIcon({
            icon: options.icon as FontAwesomeIcon,
          },
          getFAIcon
          )
          return icon;
        } catch (error) {
          console.error(
            `Error loading FontAwesome icon: ${options.icon}`,
            error
          );
        }
        break;
      default:
        break;
    }

    return null;
  };

  return iconLibrary && iconLibrary.default
    ? loadIcon()
    : Promise.resolve(null);
};

