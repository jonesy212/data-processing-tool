// ReusableButton.tsx
// platform/web/ReusableButton.tsx
import { BrandingSettings } from '@/core/branding/BrandingSettings';
import { BaseButtonProps, SharedButton } from '@/core/components/shared/Share';
import { ChildComponentProps } from '@/core/hooks/ChildComponent';
import React from 'react';

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
