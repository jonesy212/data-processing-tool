// useIconLoaderAsync.ts
import { IconName } from "@fortawesome/fontawesome-svg-core";
import { useEffect, useState } from "react";
import { getFAIcon, loadFontAwesomeIcon } from "../icons/fontAwesomeIconLoader";
import { FontAwesomeIconOptions } from "../icons/fontAwesomeIconOptions";
import { IconLibrary, loadIconLibrary } from "../icons/iconLibraryLoader";


type IconOptions = { library: IconLibrary; icon: string };

export const useIconLoaderAsync = (
  options: IconOptions
): Promise<React.ReactNode | null> => {
  const [iconLibrary, setIconLibrary] = useState<any | null>(null);

  const loadIconLibraryAsync = () => {
    loadIconLibrary(options.library).then((library) => {
      setIconLibrary(library);
    });
  };

  useEffect(() => {
    loadIconLibraryAsync();
  }, [options.library]);


  const loadIcon = async () => {
    switch (options.library) {
      // case "feather":
      // case "ionicons":
      // case "material-icons":
      //   // Add your logic to load icons for other libraries
      //   break;
      case "font-awesome":
        try {
          const icon = await loadFontAwesomeIcon(
          { icon: options.icon as unknown as FontAwesomeIconOptions as unknown as IconName },
            getFAIcon
          );
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
