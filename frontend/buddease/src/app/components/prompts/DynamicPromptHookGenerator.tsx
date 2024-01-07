// DynamicPromptHookGenerator.tsx
import createDynamicHook, { DynamicHookParams, DynamicHookResult } from '../hooks/dynamicHooks/dynamicHookGenerator';


export type DynamicPromptHookParams = DynamicHookParams;

export type DynamicPromptHookResult = DynamicHookResult;

const createDynamicPromptHook = ({ condition, asyncEffect, cleanup, resetIdleTimeout, isActive }: DynamicPromptHookParams) => {
  return createDynamicHook({ condition, asyncEffect, cleanup, resetIdleTimeout,     isActive
});
};

export default createDynamicPromptHook;
