import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // App bileşenini import et

// React uygulamasını kök (root) elementine render et
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
