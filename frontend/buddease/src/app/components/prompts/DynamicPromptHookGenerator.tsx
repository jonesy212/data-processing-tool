// DynamicPromptHookGenerator.tsx
import createDynamicHook, { DynamicHookParams, DynamicHookResult } from '../hooks/dynamicHooks/dynamicHookGenerator';


export type DynamicPromptHookParams = DynamicHookParams;

export type DynamicPromptHookResult = DynamicHookResult;

const createDynamicPromptHook = ({ condition, asyncEffect, cleanup }: DynamicPromptHookParams) => {
  return createDynamicHook({ condition, asyncEffect, cleanup });
};

export default createDynamicPromptHook;
