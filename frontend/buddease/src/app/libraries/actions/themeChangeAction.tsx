import { BrandingSettings } from '@/app/components/projects/branding/BrandingSettings';
import { createAction } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

// Define the action type
export const THEME_CHANGE = 'theme/change';

// Define the action creator function
export const themeChangeAction = createAction<BrandingSettings>(THEME_CHANGE);

const dispatch = useDispatch()

const handleThemeChange = (brandingSettings: BrandingSettings) => {
    dispatch(themeChangeAction(brandingSettings));
  };