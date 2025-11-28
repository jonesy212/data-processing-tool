// ReusableButton.tsx
// platform/web/ReusableButton.tsx
import React from 'react';
import { SharedButton, BaseButtonProps } from '@/app/platform/shared/SharedButton'
import { BrandingSettings } from '@/app/branding/BrandingSettings';
import { ChildComponentProps } from '@/app/hooks/ChildComponent';

interface WebButtonProps extends BaseButtonProps {
  // Web-specific props
  router: ChildComponentProps['router'];
  brandingSettings: BrandingSettings;
  onHover?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  animationDuration?: number;
  animationType?: 'fade' | 'slide' | 'scale';
}

const ReusableButton: React.FC<WebButtonProps> = (props) => {
  return <SharedButton {...props} />;
};

export default ReusableButton;
export type { WebButtonProps as ButtonProps };