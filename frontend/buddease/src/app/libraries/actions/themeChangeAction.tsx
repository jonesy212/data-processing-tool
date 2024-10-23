import { BrandingSettings } from '@/app/components/projects/branding/BrandingSettings';
import { createAction } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { Theme } from '../libraries/ui/theme/Theme';
import { DocumentFormattingOptions } from '@/app/components/documents/ DocumentFormattingOptionsComponent';
import { ColorSwatchProps } from '@/app/components/styling/ColorPalette';



// Define the action types
export const THEME_CHANGE = 'theme/change';
export const SET_FONT_SIZE = 'theme/setFontSize';
export const APPLY_THEME_FROM_SERVER = 'theme/applyFromServer';
export const APPLY_THEME = 'theme/apply';
export const APPLY_FONT_STYLES = 'theme/applyFontStyles';
export const APPLY_COLOR_SCHEME = 'theme/applyColorScheme';
export const APPLY_COLORS = 'theme/applyColors';

// Define the action creators
export const themeChangeAction = createAction<BrandingSettings>(THEME_CHANGE);
export const setFontSizeAction = createAction<string>(SET_FONT_SIZE);
export const applyThemeFromServerAction = createAction<void>(APPLY_THEME_FROM_SERVER);
export const applyThemeAction = createAction<BrandingSettings>(APPLY_THEME);
export const applyFontStylesAction = createAction<DocumentFormattingOptions>(APPLY_FONT_STYLES);
export const applyColorSchemeAction = createAction<string>(APPLY_COLOR_SCHEME);
export const applyColorsAction = createAction<ColorSwatchProps[]>(APPLY_COLORS);

// Add more actions as needed

const dispatch = useDispatch()

const handleThemeChange = (brandingSettings: BrandingSettings) => {
    dispatch(themeChangeAction(brandingSettings));
  };