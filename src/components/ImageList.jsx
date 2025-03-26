// src/components/ImageList.jsx
import { useState, useEffect } from 'react';
import { invoke } from "@tauri-apps/api/core";
import './ImageList.css';

function ImageList() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'Repository', direction: 'ascending' });
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, imageId: null });
  
  useEffect(() => {
    fetchImages();
    
    // Listen for refresh events from the Rust backend
    const unlisten = window.__TAURI__.event.listen('app://refresh', () => {
      fetchImages();
    });
    
    return () => {
      unlisten.then(fn => fn());
    };
  }, []);
  
  const fetchImages = async () => {
    setLoading(true);
    try {
      const result = await invoke('get_images');
      
      if (result.success) {
        // Parse the JSON lines from stdout
        const parsedImages = result.stdout
          .trim()
          .split('\n')
          .filter(line => line.trim() !== '')
          .map(line => JSON.parse(line));
        
        setImages(parsedImages);
      } else {
        console.error('Error fetching images:', result.stderr);
      }
    } catch (error) {
      console.error('Error invoking get_images:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemoveImage = async (imageId) => {
    // Close context menu if open
    setContextMenu({ visible: false, x: 0, y: 0, imageId: null });
    
    // Ask for confirmation
    if (!window.confirm(`Are you sure you want to remove image ${imageId}?`)) {
      return;
    }
    
    try {
      const result = await invoke('remove_image', { imageId });
      
      if (result.success) {
        // Refresh the list
        fetchImages();
      } else {
        // Show error message
        alert(`Failed to remove image: ${result.stderr}`);
      }
    } catch (error) {
      console.error('Error removing image:', error);
      alert(`Error: ${error.message}`);
    }
  };
  
  const handlePullImage = () => {
    // This would open a modal dialog for pulling an image
    alert('Pull image functionality would be implemented here');
  };
  
  const formatSize = (sizeInBytes) => {
    if (!sizeInBytes) return 'N/A';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = parseInt(sizeInBytes, 10);
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };
  
  const formatCreatedTime = (createdTime) => {
    if (!createdTime) return 'N/A';
    
    // Convert relative time (e.g., "2 days ago") to a more specific format
    if (createdTime.includes('ago')) {
      return createdTime;
    }
    
    // Try to parse as date if it's not a relative time
    try {
      const date = new Date(createdTime);
      return date.toLocaleString();
    } catch {
      return createdTime;
    }
  };
  
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const sortedImages = [...images].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });
  
  const filteredImages = sortedImages.filter(image => {
    const searchableFields = `${image.Repository || ''} ${image.Tag || ''} ${image.ID || image.Id || ''}`.toLowerCase();
    return searchableFields.includes(filterText.toLowerCase());
  });
  
  const handleContextMenu = (e, imageId) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      imageId,
    });
  };
  
  const handleClick = () => {
    // Close context menu when clicking elsewhere
    if (contextMenu.visible) {
      setContextMenu({ visible: false, x: 0, y: 0, imageId: null });
    }
  };
  
  return (
    <div className="image-list" onClick={handleClick}>
      <div className="panel-header">
        <h2>Images</h2>
        <div className="search-filter">
          <div className="search-container">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24">
              <path 
                fill="currentColor" 
                d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
              />
            </svg>
            <input
              type="text"
              placeholder="Filter images..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
          <button className="action-button primary" onClick={handlePullImage}>
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path 
                fill="currentColor" 
                d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"
              />
            </svg>
            <span>Pull Image</span>
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading images...</p>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" className="empty-icon">
            <path 
              fill="currentColor" 
              d="M21.5 2h-19C1.675 2 1 2.675 1 3.5v17c0 .825.675 1.5 1.5 1.5h19c.825 0 1.5-.675 1.5-1.5v-17c0-.825-.675-1.5-1.5-1.5zm-1.5 6h-4v1h4v1h-4v1h4v1h-4v1h4v1h-16V4h16v4z"
            />
          </svg>
          <h3>No images found</h3>
          <p>
            {filterText 
              ? `No images match your search "${filterText}"`
              : "Pull an image to get started"}
          </p>
          {filterText && (
            <button 
              className="clear-filter-button"
              onClick={() => setFilterText('')}
            >
              Clear Filter
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="image-table-header">
            <div 
              className={`image-repository sortable ${sortConfig.key === 'Repository' ? `sorted-${sortConfig.direction}` : ''}`}
              onClick={() => handleSort('Repository')}
            >
              Repository
              <svg className="sort-icon" width="16" height="16" viewBox="0 0 24 24">
                <path 
                  fill="currentColor" 
                  d="M7 10l5 5 5-5z"
                />
              </svg>
            </div>
            <div 
              className={`image-tag sortable ${sortConfig.key === 'Tag' ? `sorted-${sortConfig.direction}` : ''}`}
              onClick={() => handleSort('Tag')}
            >
              Tag
              <svg className="sort-icon" width="16" height="16" viewBox="0 0 24 24">
                <path 
                  fill="currentColor" 
                  d="M7 10l5 5 5-5z"
                />
              </svg>
            </div>
            <div className="image-id">Image ID</div>
            <div 
              className={`image-size sortable ${sortConfig.key === 'Size' ? `sorted-${sortConfig.direction}` : ''}`}
              onClick={() => handleSort('Size')}
            >
              Size
              <svg className="sort-icon" width="16" height="16" viewBox="0 0 24 24">
                <path 
                  fill="currentColor" 
                  d="M7 10l5 5 5-5z"
                />
              </svg>
            </div>
            <div 
              className={`image-created sortable ${sortConfig.key === 'CreatedAt' ? `sorted-${sortConfig.direction}` : ''}`}
              onClick={() => handleSort('CreatedAt')}
            >
              Created
              <svg className="sort-icon" width="16" height="16" viewBox="0 0 24 24">
                <path 
                  fill="currentColor" 
                  d="M7 10l5 5 5-5z"
                />
              </svg>
            </div>
            <div className="image-actions">Actions</div>
          </div>
          
          <div className="image-list-content">
            {filteredImages.map((image) => (
              <div 
                key={image.ID || image.Id} 
                className={`image-item ${selectedImage === (image.ID || image.Id) ? 'selected' : ''}`}
                onClick={() => setSelectedImage(image.ID || image.Id)}
                onContextMenu={(e) => handleContextMenu(e, image.ID || image.Id)}
              >
                <div className="image-repository">
                  <div className="image-name-text">{image.Repository || '<none>'}</div>
                </div>
                
                <div className="image-tag">{image.Tag || '<none>'}</div>
                
                <div className="image-id" title={image.ID || image.Id}>
                  {(image.ID || image.Id).substring(0, 12)}
                </div>
                
                <div className="image-size">{formatSize(image.Size)}</div>
                
                <div className="image-created">{formatCreatedTime(image.CreatedAt || image.Created)}</div>
                
                <div className="image-actions">
                  <button 
                    className="action-button icon-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(image.ID || image.Id);
                    }}
                    title="Remove"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path 
                        fill="currentColor" 
                        d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                      />
                    </svg>
                  </button>
                  <button 
                    className="action-button icon-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Copy image ID to clipboard
                      navigator.clipboard.writeText(image.ID || image.Id);
                    }}
                    title="Copy ID"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path 
                        fill="currentColor" 
                        d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      
      {contextMenu.visible && (
        <div 
          className="context-menu"
          style={{ 
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`
          }}
        >
          <ul>
            <li onClick={() => {
              navigator.clipboard.writeText(contextMenu.imageId);
              setContextMenu({ visible: false, x: 0, y: 0, imageId: null });
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path 
                  fill="currentColor" 
                  d="M21 14h-1V7a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v7H3a1 1 0 0 0-1 1v2a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-2a1 1 0 0 0-1-1zM6 7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v7H6V7zm14 10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-1h16v1z"
                />
              </svg>
              Create Container
            </li>
            <li onClick={() => {
              handleRemoveImage(contextMenu.imageId);
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path 
                  fill="currentColor" 
                  d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                />
              </svg>
              Remove Image
            </li>
            <li onClick={() => {
              // Show image details
              alert(`Image details dialog would open for: ${contextMenu.imageId}`);
              setContextMenu({ visible: false, x: 0, y: 0, imageId: null });
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path 
                  fill="currentColor" 
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
                />
              </svg>
              View Details
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default ImageList;