// iconLibraryLoader.ts
type IconLibrary =
  "feather"
  | "ionicons"
  | "material-icons"
  | "font-awesome";

export const loadIconLibrary = async (library: IconLibrary): Promise<any> => {
    switch (library) {
      //todo uncomment to use the specific library of your choice once you install it
    // case "feather":
    //   return import("react-feather");
    // case "ionicons":
    //   return import("react-ionicons");
    // case "material-icons":
    //   return import("react-material-icons");
    case "font-awesome":
      return await import("@fortawesome/fontawesome-svg-core");
    default:
      throw new Error(`Unsupported icon library: ${library}`);
  }
};


export type { IconLibrary };
