import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getContainer, getItems } from '../services/api';

const ContainerDetails = () => {
  const { containerId } = useParams();
  const [container, setContainer] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [containerData, itemsData] = await Promise.all([
          getContainer(containerId),
          getItems()
        ]);
        setContainer(containerData);
        setItems(itemsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [containerId]);

  if (loading) return <div>Loading container details...</div>;
  if (!container) return <div>Container not found</div>;

  const containerItems = items.filter(item => item.container_id === containerId);

  return (
    <div className="container-details-page">
      <h2>Container {containerId}</h2>
      <div className="container-info">
        <div className="info-card">
          <h4>Zone</h4>
          <p>{container.zone}</p>
        </div>
        <div className="info-card">
          <h4>Dimensions</h4>
          <p>{container.width} × {container.depth} × {container.height} cm</p>
        </div>
        <div className="info-card">
          <h4>Capacity</h4>
          <p>{container.used_capacity || 0}% utilized</p>
        </div>
      </div>

      <h3>Items ({containerItems.length})</h3>
      {containerItems.length > 0 ? (
        <table className="items-table">
          {/* Same table structure as in Containers.jsx */}
        </table>
      ) : (
        <div className="empty-container">
          <p>No items stored in this container</p>
        </div>
      )}
    </div>
  );
};

export default ContainerDetails;