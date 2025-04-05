import React, { useState, useEffect } from 'react';
import { getContainers, getItems } from '../services/api';
import ContainerForm from '../components/ContainerForm';

const ContainersPage = () => {
  const [containers, setContainers] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [containersData, itemsData] = await Promise.all([
          getContainers(),
          getItems()
        ]);
        setContainers(containersData);
        setItems(itemsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleContainerAdded = (newContainer) => {
    setContainers([...containers, newContainer]);
  };

  const getItemsInContainer = (containerId) => {
    return items.filter(item => item.container_id === containerId);
  };

  if (loading) return <div>Loading containers...</div>;

  return (
    <div className="containers-page">
      <h2>Storage Container Management</h2>
      
      <div className="container-content">
        <div className="container-form-section">
          <ContainerForm onContainerAdded={handleContainerAdded} />
        </div>
        
        <div className="container-display-section">
          <div className="container-list">
            <h3>Available Containers ({containers.length})</h3>
            <table className="containers-table">
              <thead>
                <tr>
                  <th>Container ID</th>
                  <th>Zone</th>
                  <th>Dimensions</th>
                  <th>Items</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {containers.map(container => (
                  <tr 
                    key={container.container_id}
                    className={selectedContainer === container.container_id ? 'selected' : ''}
                    onClick={() => setSelectedContainer(container.container_id)}
                  >
                    <td>{container.container_id}</td>
                    <td>{container.zone}</td>
                    <td>{container.width}×{container.depth}×{container.height}cm</td>
                    <td>{getItemsInContainer(container.container_id).length}</td>
                    <td>
                      <button 
                        className="view-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedContainer(container.container_id);
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedContainer && (
            <div className="container-details">
              <h3>Contents of {selectedContainer}</h3>
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Item ID</th>
                    <th>Name</th>
                    <th>Dimensions</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {getItemsInContainer(selectedContainer).length > 0 ? (
                    getItemsInContainer(selectedContainer).map(item => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.name}</td>
                        <td>{item.width}×{item.depth}×{item.height}cm</td>
                        <td className={`priority-${item.priority}`}>
                          {item.priority}
                        </td>
                        <td className={`status-${item.status}`}>
                          {item.status || 'active'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="empty-message">
                        No items in this container
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContainersPage;