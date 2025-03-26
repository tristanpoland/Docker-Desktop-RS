// src/components/TitleBar.jsx
import { useState, useEffect } from 'react';
import { getCurrentWindow } from "@tauri-apps/api/window";
import './TitleBar.css';

let appWindow = getCurrentWindow();

function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);
  
  useEffect(() => {
    const checkMaximized = async () => {
      const maximized = await appWindow.isMaximized();
      setIsMaximized(maximized);
    };
    
    checkMaximized();
    
    // Listen for window resize events
    const unlisten = appWindow.onResized(() => {
      checkMaximized();
    });
    
    return () => {
      unlisten.then(fn => fn());
    };
  }, []);
  
  const handleMinimize = () => {
    appWindow.minimize();
  };
  
  const handleMaximize = () => {
    if (isMaximized) {
      appWindow.unmaximize();
    } else {
      appWindow.maximize();
    }
  };
  
  const handleClose = () => {
    appWindow.close();
  };
  
  return (
    <div className="titlebar" data-tauri-drag-region>
      <div className="titlebar-logo" data-tauri-drag-region>
        <img src="/logo.svg" alt="Docker Clone" width="22" height="22" />
        <span>Docker Desktop</span>
      </div>
      
      <div className="titlebar-center" data-tauri-drag-region>
        <div className="search-bar">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24">
            <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input 
            type="text" 
            placeholder="Search containers, images..." 
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
      
      <div className="titlebar-controls">
        <button 
          className="titlebar-button" 
          id="titlebar-minimize"
          onClick={handleMinimize}
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect width="10" height="1" x="1" y="5.5" fill="currentColor" />
          </svg>
        </button>
        
        <button 
          className="titlebar-button" 
          id="titlebar-maximize"
          onClick={handleMaximize}
        >
          {isMaximized ? (
            <svg width="12" height="12" viewBox="0 0 12 12">
              <path fill="currentColor" d="M3.5 1h5a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2zm0 2v5h5V3h-5z"/>
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12">
              <rect width="9" height="9" x="1.5" y="1.5" fill="none" stroke="currentColor" />
            </svg>
          )}
        </button>
        
        <button 
          className="titlebar-button" 
          id="titlebar-close"
          onClick={handleClose}
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path 
              fill="currentColor" 
              d="M6 5.293l4.646-4.647a.5.5 0 0 1 .708.708L6.707 6l4.647 4.646a.5.5 0 0 1-.708.708L6 6.707l-4.646 4.647a.5.5 0 0 1-.708-.708L5.293 6 .646 1.354a.5.5 0 1 1 .708-.708L6 5.293z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default TitleBar;