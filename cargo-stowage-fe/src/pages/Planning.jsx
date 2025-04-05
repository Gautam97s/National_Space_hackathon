import React, { useState, useEffect } from 'react';
import { getItems, getContainers } from '../services/api';
import PlacementVisualizer from '../components/PlacementVisualizer';

const PlanningPage = () => {
  const [items, setItems] = useState([]);
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsData, containersData] = await Promise.all([
          getItems(),
          getContainers()
        ]);
        setItems(itemsData);
        setContainers(containersData);
      } catch (error) {
        console.error("Data loading failed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading planning data...</div>;

  return (
    <div className="planning-page">
      <h2>Cargo Placement Planning</h2>
      
      <div className="planning-stats">
        <div className="stat-item">
          <h4>Items to Place</h4>
          <p>{items.filter(i => !i.container_id).length} unplaced</p>
        </div>
        <div className="stat-item">
          <h4>Available Containers</h4>
          <p>{containers.length} total</p>
        </div>
        <div className="stat-item">
          <h4>Total Capacity</h4>
          <p>
            {containers.reduce((sum, c) => sum + (c.width * c.depth * c.height), 0)} cm³
          </p>
        </div>
      </div>

      <PlacementVisualizer items={items} containers={containers} />
      
      <div className="container-map">
        <h3>Container Space Utilization</h3>
        <div className="map-grid">
          {containers.map(container => (
            <div key={container.container_id} className="map-item">
              <h5>{container.container_id}</h5>
              <div className="utilization-chart">
                <div 
                  className="utilization-bar" 
                  style={{ height: `${container.used_capacity || 0}%` }}
                ></div>
              </div>
              <p>{container.zone}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlanningPage;