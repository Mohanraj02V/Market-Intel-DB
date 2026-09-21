import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import marketEventReducer from '../features/marketEvents/marketEventSlice';
import prospectReducer from '../features/prospects/prospectSlice';
import lqPipelineReducer from '../features/lqPipeline/lqPipelineSlice';
import userReducer from '../features/users/userSlice';
import outreachReducer from '../features/outreach/outreachSlice';

const appReducer = combineReducers({
  auth: authReducer,
  prospects: prospectReducer,
  marketEvents: marketEventReducer,
  lqPipeline: lqPipelineReducer,
  users: userReducer,
  outreach: outreachReducer,
});

const rootReducer = (state, action) => {
  if (action.type === 'auth/logout') {
    state = undefined;
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});
