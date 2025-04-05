import React, { useState, useEffect } from 'react';
import { getItems, getLogs } from '../services/api';
import RetrievalPath from '../components/RetrievalPath';

const OperationsPage = () => {
  const [items, setItems] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsData, logsData] = await Promise.all([
          getItems(),
          getLogs()
        ]);
        setItems(itemsData);
        setLogs(logsData.logs || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading operations data...</div>;

  return (
    <div className="page-container">
      <h2>Daily Operations</h2>
      
      <div className="operations-grid">
        <div className="retrieval-section">
          <RetrievalPath items={items} />
        </div>
        
        <div className="activity-section">
          <h3>Recent Activity</h3>
          <div className="log-list">
            {logs.slice(0, 10).map(log => (
              <div key={log.timestamp} className="log-entry">
                <span className="log-time">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className="log-action">{log.action_type}</span>
                <span className="log-item">Item #{log.item_id}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationsPage;