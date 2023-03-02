import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import App from './App';
import { WidgetWrapper } from './WidgetWrapper';

const jsxBody = WidgetWrapper.toString().split('\n').slice(6, -1).join('\n');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App jsxBody={jsxBody} />
  </React.StrictMode>
);
