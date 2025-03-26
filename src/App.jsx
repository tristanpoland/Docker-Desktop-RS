// src/App.jsx
import { useState, useEffect } from 'react';
import ContainerList from './components/ContainerList';
import ImageList from './components/ImageList';
import Sidebar from './components/Sidebar';
import TitleBar from './components/TitleBar';

// Tauri v2 imports
import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import './App.css';

// Get window reference
const appWindow = getCurrentWindow();

function App() {
  const [activeTab, setActiveTab] = useState('containers');
  const [containers, setContainers] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dockerStatus, setDockerStatus] = useState('checking');

  useEffect(() => {
    checkDockerStatus();
    
    const interval = setInterval(() => {
      fetchData();
    }, 5000);
    
    // Listen for events from the Rust backend
    const unlisten = appWindow.listen('app://refresh', () => {
      fetchData();
    });
    
    const unlistenTab = appWindow.listen('app://setTab', (event) => {
      setActiveTab(event.payload);
    });
    
    return () => {
      clearInterval(interval);
      unlisten.then(fn => fn());
      unlistenTab.then(fn => fn());
    };
  }, []);
  
  const checkDockerStatus = async () => {
    try {
      // Use invoke instead of Command API
      const dockerInfo = await invoke('check_docker');
      
      if (dockerInfo.running) {
        setDockerStatus('running');
        fetchData();
      } else {
        setDockerStatus('stopped');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking Docker status:', error);
      setDockerStatus('not-installed');
      setLoading(false);
    }
  };

  const fetchData = async () => {
    if (dockerStatus !== 'running') return;
    
    setLoading(true);
    
    try {
      // Fetch containers using invoke
      const containersOutput = await invoke('get_containers');
      
      if (containersOutput.success) {
        const parsedContainers = containersOutput.stdout
          .trim()
          .split('\n')
          .filter(line => line.trim() !== '')
          .map(line => JSON.parse(line));
        
        setContainers(parsedContainers);
      }
      
      // Fetch images using invoke
      const imagesOutput = await invoke('get_images');
      
      if (imagesOutput.success) {
        const parsedImages = imagesOutput.stdout
          .trim()
          .split('\n')
          .filter(line => line.trim() !== '')
          .map(line => JSON.parse(line));
        
        setImages(parsedImages);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startContainer = async (containerId) => {
    try {
      await invoke('start_container', { containerId });
      fetchData();
    } catch (error) {
      console.error('Error starting container:', error);
    }
  };

  const stopContainer = async (containerId) => {
    try {
      await invoke('stop_container', { containerId });
      fetchData();
    } catch (error) {
      console.error('Error stopping container:', error);
    }
  };

  const removeContainer = async (containerId) => {
    try {
      await invoke('remove_container', { containerId });
      fetchData();
    } catch (error) {
      console.error('Error removing container:', error);
    }
  };

  const removeImage = async (imageId) => {
    try {
      await invoke('remove_image', { imageId });
      fetchData();
    } catch (error) {
      console.error('Error removing image:', error);
    }
  };

  return (
    <div className="app">
      <TitleBar />
      
      <div className="app-body">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          dockerStatus={dockerStatus}
          onRefresh={fetchData}
        />
        
        <main className="content">
          {dockerStatus === 'running' ? (
            <>
              {activeTab === 'containers' && (
                <ContainerList 
                  containers={containers} 
                  loading={loading}
                  onStart={startContainer}
                  onStop={stopContainer}
                  onRemove={removeContainer}
                />
              )}
              
              {activeTab === 'images' && (
                <ImageList 
                  images={images} 
                  loading={loading}
                  onRemove={removeImage}
                />
              )}
            </>
          ) : (
            <div className="docker-status">
              {dockerStatus === 'stopped' && (
                <div className="status-message">
                  <h2>Docker Engine is not running</h2>
                  <p>Please start Docker Engine to use this application</p>
                  <button className="primary-button" onClick={checkDockerStatus}>
                    Retry Connection
                  </button>
                </div>
              )}
              
              {dockerStatus === 'not-installed' && (
                <div className="status-message">
                  <h2>Docker Not Found</h2>
                  <p>Please install Docker to use this application</p>
                  <a 
                    href="https://docs.docker.com/get-docker/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="primary-button"
                  >
                    Get Docker
                  </a>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;