type ApiVidusalPreferences = {
    setTheme: (theme: string) => Promise<void>;
    setDarkMode: (isDarkMode: boolean) => Promise<void>;
    setFontSize: (fontSize: number) => Promise<void>;
    setColorScheme: (colorScheme: string) => Promise<void>;
    setLogoPreferences: (logoPreferences: any) => Promise<void>;
    setIconPreferences: (iconPreferences: any) => Promise<void>;
    setBackgroundPreferences: (backgroundPreferences: any) => Promise<void>;
    setAvatarPreferences: (avatarPreferences: any) => Promise<void>;
    // Add more visual preferences endpoints as needed...
}
  

