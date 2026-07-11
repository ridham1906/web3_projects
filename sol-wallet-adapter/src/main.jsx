import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Buffer } from "buffer";
import process from "process";

globalThis.Buffer = Buffer;
globalThis.process = process;

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
