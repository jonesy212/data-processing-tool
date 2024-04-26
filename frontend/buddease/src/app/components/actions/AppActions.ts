// AppActions.ts
import { createAction } from '@reduxjs/toolkit';


export const AppActions = {
    createTask: createAction<string>('task/createTask'),
    updateTask: createAction<{ id: string, updates: Object }>('task/updateTask'),
    

}