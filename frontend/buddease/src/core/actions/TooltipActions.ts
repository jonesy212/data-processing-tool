// TooltipActions.ts
import { createAction } from '@reduxjs/toolkit';

export const TooltipActions = {
    showTooltip: createAction<string>('tooltip/showTooltip'),
    hideTooltip: createAction('tooltip/hideTooltip'),
}
