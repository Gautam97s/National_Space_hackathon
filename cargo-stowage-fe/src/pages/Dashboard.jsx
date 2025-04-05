import React, { useState, useEffect } from 'react';
import { getItems, getContainers, getLogs } from '../services/api';
import StatusPanel from '../components/StatusPanel';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    items: 0,
    containers: 0,
    waste: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [items, containers, logs] = await Promise.all([
          getItems(),
          getContainers(),
          getLogs({ limit: 5 })
        ]);
        
        setStats({
          items: items.length,
          containers: containers.length,
          waste: items.filter(i => i.status === 'waste').length
        });
        
        setRecentActivity(logs.logs || []);
      } catch (error) {
        console.error("Dashboard data loading failed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard-page">
      <h2>ISS Cargo Stowage Overview</h2>
      
      <StatusPanel />
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Items</h3>
          <p className="stat-value">{stats.items}</p>
        </div>
        <div className="stat-card">
          <h3>Containers</h3>
          <p className="stat-value">{stats.containers}</p>
        </div>
        <div className="stat-card">
          <h3>Waste Items</h3>
          <p className="stat-value">{stats.waste}</p>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <ul>
          {recentActivity.map((log, index) => (
            <li key={index}>
              <span className="log-time">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className="log-action">{log.action_type}</span>
              <span className="log-details">
                {log.user_id} interacted with item {log.item_id}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DashboardPage;