import React from 'react';
import { Provider } from 'react-redux';
import { store } from './app/store';
import AppRouter from './router/AppRouter';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Provider store={store}>
      <AppRouter />
      <ToastContainer position="bottom-right" />
    </Provider>
  );
}

export default App;
