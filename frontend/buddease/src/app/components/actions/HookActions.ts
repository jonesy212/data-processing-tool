import { createAction } from '@reduxjs/toolkit';


export const HookActions = {
  enable: createAction("enable"),
    disable: createAction("disable"),
  setActive: createAction<boolean>("setActive"),
}