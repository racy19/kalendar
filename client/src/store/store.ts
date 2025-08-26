import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import authReducer, { login, logout } from './auth/authSlice';
import themeReducer from './themeSlice';
import {
  persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';

const rootReducer = combineReducers({ 
  auth: authReducer,
  theme: themeReducer,
});

const persistConfig = { key: 'root', storage, whitelist: ['auth'] };
const persistedReducer = persistReducer(persistConfig, rootReducer);

// ---- session timer ----
let logoutTimer: number | null = null;

function getJwtExpMs(token: string): number | null {
  try {
    const [, payloadB64] = token.split('.');
    const json = JSON.parse(payloadB64
      ? atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"))
      : ""
    );
    if (typeof json.exp === 'number') return json.exp * 1000;
  } catch { }
  return null;
}

function scheduleLogout(token: string, dispatch: any) {
  if (logoutTimer) {
    clearTimeout(logoutTimer);
    logoutTimer = null;
  }
  const expMs = getJwtExpMs(token);
  if (!expMs) return;
  const msLeft = expMs - Date.now() - 5000; // small buffer for clock skew
  if (msLeft <= 0) {
    dispatch(logout());
    return;
  }
  logoutTimer = window.setTimeout(() => dispatch(logout()), msLeft);
}

function clearLogoutSchedule() {
  if (logoutTimer) {
    clearTimeout(logoutTimer);
    logoutTimer = null;
  }
}

// ---- listener middleware on login/logout ----
const sessionListener = createListenerMiddleware();

sessionListener.startListening({
  actionCreator: login,
  effect: async (action, api) => {
    scheduleLogout(action.payload.token, api.dispatch);
  },
});

sessionListener.startListening({
  actionCreator: logout,
  effect: async (_, _api) => {
    clearLogoutSchedule();
  },
});

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] },
    }).concat(sessionListener.middleware),
});

export const persistor = persistStore(store);

persistor.subscribe(() => {
  const state = store.getState() as any;
  const token = state.auth?.token;
  if (token) {
    scheduleLogout(token, store.dispatch);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;