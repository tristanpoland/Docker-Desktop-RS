// src/components/ContainerList.jsx
import { useState } from 'react';
import './ContainerList.css';

function ContainerList({ containers, loading, onStart, onStop, onRemove }) {
  const [selectedContainer, setSelectedContainer] = useState(null);
  
  const handleAction = (action, containerId, e) => {
    e.stopPropagation();
    
    switch(action) {
      case 'start':
        onStart(containerId);
        break;
      case 'stop':
        onStop(containerId);
        break;
      case 'remove':
        onRemove(containerId);
        break;
      default:
        break;
    }
  };
  
  const getStatusColor = (status) => {
    if (status.includes('Up')) return 'green';
    if (status.includes('Exited')) return 'red';
    return 'yellow';
  };
  
  return (
    <div className="container-list">
      <div className="panel-header">
        <h2>Containers</h2>
        <div className="header-actions">
          <button className="action-button primary">
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path 
                fill="currentColor" 
                d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
              />
            </svg>
            <span>Create Container</span>
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading containers...</p>
        </div>
      ) : containers.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" className="empty-icon">
            <path 
              fill="currentColor" 
              d="M21 14h-1V7a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v7H3a1 1 0 0 0-1 1v2a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-2a1 1 0 0 0-1-1zM6 7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v7H6V7zm14 10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-1h16v1z"
            />
          </svg>
          <h3>No containers found</h3>
          <p>Create a container to get started</p>
        </div>
      ) : (
        <>
          <div className="container-table-header">
            <div className="container-name">Name</div>
            <div className="container-image">Image</div>
            <div className="container-status">Status</div>
            <div className="container-ports">Ports</div>
            <div className="container-actions">Actions</div>
          </div>
          
          <div className="container-list-content">
            {containers.map((container) => (
              <div 
                key={container.ID || container.Id} 
                className={`container-item ${selectedContainer === container.ID ? 'selected' : ''}`}
                onClick={() => setSelectedContainer(container.ID || container.Id)}
              >
                <div className="container-name">
                  <div className="container-name-text">{container.Names || container.Name}</div>
                </div>
                
                <div className="container-image">{container.Image}</div>
                
                <div className="container-status">
                  <span className={`status-indicator ${getStatusColor(container.Status)}`}></span>
                  <span className="status-text">{container.Status}</span>
                </div>
                
                <div className="container-ports">{container.Ports}</div>
                
                <div className="container-actions">
                  {container.Status.includes('Up') ? (
                    <button 
                      className="action-button"
                      onClick={(e) => handleAction('stop', container.ID || container.Id, e)}
                      title="Stop"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24">
                        <path 
                          fill="currentColor" 
                          d="M6 6h12v12H6z"
                        />
                      </svg>
                    </button>
                  ) : (
                    <button 
                      className="action-button"
                      onClick={(e) => handleAction('start', container.ID || container.Id, e)}
                      title="Start"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24">
                        <path 
                          fill="currentColor" 
                          d="M8 5v14l11-7z"
                        />
                      </svg>
                    </button>
                  )}
                  
                  <button 
                    className="action-button"
                    onClick={(e) => handleAction('remove', container.ID || container.Id, e)}
                    title="Remove"
                    disabled={container.Status.includes('Up')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path 
                        fill="currentColor" 
                        d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ContainerList;