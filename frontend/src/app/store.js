import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import marketEventReducer from '../features/marketEvents/marketEventSlice';
import prospectReducer from '../features/prospects/prospectSlice';
import lqPipelineReducer from '../features/lqPipeline/lqPipelineSlice';
import userReducer from '../features/users/userSlice';
import outreachReducer from '../features/outreach/outreachSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    prospects: prospectReducer,
    marketEvents: marketEventReducer,
    lqPipeline: lqPipelineReducer,
    users: userReducer,
    outreach: outreachReducer,
  },
});
