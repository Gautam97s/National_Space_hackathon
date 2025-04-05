import React, { useState } from 'react';
import { simulateDays, getItems } from '../services/api';

const SimulationPage = () => {
  const [daysToSimulate, setDaysToSimulate] = useState(1);
  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const result = await simulateDays(daysToSimulate, []);
      setSimulationResult(result);
      
      // Refresh items after simulation
      const itemsData = await getItems();
      // You would typically update a global state here
    } catch (error) {
      console.error("Simulation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h2>Time Simulation</h2>
      
      <div className="simulation-controls">
        <div className="input-group">
          <label>Days to simulate:</label>
          <input
            type="number"
            value={daysToSimulate}
            onChange={(e) => setDaysToSimulate(parseInt(e.target.value))}
            min="1"
            max="30"
          />
        </div>
        <button onClick={handleSimulate} disabled={loading}>
          {loading ? 'Simulating...' : 'Run Simulation'}
        </button>
      </div>

      {simulationResult && (
        <div className="simulation-results">
          <h3>Simulation Results</h3>
          <p>New date: {simulationResult.newDate}</p>
          
          {simulationResult.itemsExpired?.length > 0 && (
            <div className="result-section">
              <h4>Expired Items</h4>
              <ul>
                {simulationResult.itemsExpired.map(item => (
                  <li key={item.itemId}>{item.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SimulationPage;