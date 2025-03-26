// src/components/Sidebar.jsx
import { useState } from 'react';
import './Sidebar.css';

function Sidebar({ activeTab, setActiveTab, dockerStatus, onRefresh }) {
  const [expanded, setExpanded] = useState(true);
  
  return (
    <div className={`sidebar ${expanded ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-toggle" onClick={() => setExpanded(!expanded)}>
        {expanded ? (
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="currentColor" d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="currentColor" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        )}
      </div>
      
      <div className="sidebar-content">
        <div className="sidebar-header">
          <div className="docker-status-indicator">
            <div className={`status-dot ${dockerStatus === 'running' ? 'green' : 'red'}`}></div>
            {expanded && (
              <span>
                {dockerStatus === 'running' ? 'Docker Engine Running' : 'Docker Engine Stopped'}
              </span>
            )}
          </div>
          
          {expanded && (
            <button 
              className="refresh-button" 
              onClick={onRefresh}
              disabled={dockerStatus !== 'running'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path 
                  fill="currentColor" 
                  d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 10h7V3l-2.35 3.35z"
                />
              </svg>
              <span>Refresh</span>
            </button>
          )}
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            <li 
              className={activeTab === 'containers' ? 'active' : ''}
              onClick={() => setActiveTab('containers')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path 
                  fill="currentColor" 
                  d="M21 14h-1V7a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v7H3a1 1 0 0 0-1 1v2a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-2a1 1 0 0 0-1-1zM6 7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v7H6V7zm14 10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-1h16v1z"
                />
              </svg>
              {expanded && <span>Containers</span>}
            </li>
            
            <li 
              className={activeTab === 'images' ? 'active' : ''}
              onClick={() => setActiveTab('images')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path 
                  fill="currentColor" 
                  d="M21.5 2h-19C1.675 2 1 2.675 1 3.5v17c0 .825.675 1.5 1.5 1.5h19c.825 0 1.5-.675 1.5-1.5v-17c0-.825-.675-1.5-1.5-1.5zm-1.5 6h-4v1h4v1h-4v1h4v1h-4v1h4v1h-16V4h16v4z"
                />
              </svg>
              {expanded && <span>Images</span>}
            </li>
            
            <li 
              className={activeTab === 'volumes' ? 'active' : ''}
              onClick={() => setActiveTab('volumes')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path 
                  fill="currentColor" 
                  d="M19.4 7.25a1.25 1.25 0 10-2.5 0 1.25 1.25 0 002.5 0zM12 7c-1.93 0-3.5-1.57-3.5-3.5S10.07 0 12 0s3.5 1.57 3.5 3.5S13.93 7 12 7zm0-5c-.83 0-1.5.67-1.5 1.5S11.17 5 12 5s1.5-.67 1.5-1.5S12.83 2 12 2zM3.5 7C5.43 7 7 8.57 7 10.5S5.43 14 3.5 14 0 12.43 0 10.5 1.57 7 3.5 7zm0 5c.83 0 1.5-.67 1.5-1.5S4.33 9 3.5 9 2 9.67 2 10.5 2.67 12 3.5 12zm17-5c1.93 0 3.5 1.57 3.5 3.5S22.43 14 20.5 14 17 12.43 17 10.5 18.57 7 20.5 7zm-5 1.5C15.5 10.43 14 12 12 12s-3.5-1.57-3.5-3.5S10.07 5 12 5s3.5 1.57 3.5 3.5zm-11 10C4.43 18.5 6 20 8 20s3.5-1.5 3.5-3.5S10 13 8 13s-3.5 1.5-3.5 3.5zm11 0c0 2 1.5 3.5 3.5 3.5s3.5-1.5 3.5-3.5-1.57-3.5-3.5-3.5-3.5 1.5-3.5 3.5z"
                />
              </svg>
              {expanded && <span>Volumes</span>}
            </li>
            
            <li 
              className={activeTab === 'networks' ? 'active' : ''}
              onClick={() => setActiveTab('networks')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path 
                  fill="currentColor" 
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 16.5v-2.5H7v-3h4V10H5v8h6v.5zm7-6.5h-4V14h4v3.5H9.5V17h8V10h-8z"
                />
              </svg>
              {expanded && <span>Networks</span>}
            </li>
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <div 
            className={`sidebar-footer-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path 
                fill="currentColor" 
                d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
              />
            </svg>
            {expanded && <span>Settings</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;