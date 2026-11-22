// Nạp React, thành phần App và CSS dùng cho toàn bộ website.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';

// Tìm thẻ <div id="root"> trong index.html và đưa giao diện App vào đó.
// StrictMode giúp phát hiện cách dùng React chưa đúng trong lúc phát triển.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
