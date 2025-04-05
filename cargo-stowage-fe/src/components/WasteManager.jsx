import React, { useState, useEffect } from 'react';
import { 
  identifyWaste,
  generateReturnPlan,
  completeUndocking
} from '../services/api';

const WasteManager = () => {
  const [wasteItems, setWasteItems] = useState([]);
  const [returnPlan, setReturnPlan] = useState(null);
  const [containerId, setContainerId] = useState('');
  const [maxWeight, setMaxWeight] = useState(100);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWaste = async () => {
      try {
        const { wasteItems } = await identifyWaste();
        setWasteItems(wasteItems || []);
      } catch (error) {
        console.error("Failed to fetch waste items:", error);
      }
    };
    fetchWaste();
  }, []);

  const handleGeneratePlan = async () => {
    if (!containerId) return;
    setLoading(true);
    try {
      const plan = await generateReturnPlan(containerId, maxWeight);
      setReturnPlan(plan);
    } catch (error) {
      console.error("Plan generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUndocking = async () => {
    if (!containerId) return;
    setLoading(true);
    try {
      await completeUndocking(containerId);
      const { wasteItems } = await identifyWaste();
      setWasteItems(wasteItems || []);
      setReturnPlan(null);
      alert("Undocking completed successfully!");
    } catch (error) {
      console.error("Undocking failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="waste-management">
      <h3>Waste Management System</h3>
      
      <div className="waste-list">
        <h4>Identified Waste Items ({wasteItems.length})</h4>
        {wasteItems.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Container</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {wasteItems.map(item => (
                <tr key={item.item_id}>
                  <td>{item.name}</td>
                  <td>{item.container_id}</td>
                  <td className={`reason-${item.reason.toLowerCase().replace(' ', '-')}`}>
                    {item.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No waste items identified</p>
        )}
      </div>

      <div className="return-planning">
        <h4>Waste Return Planning</h4>
        <div className="plan-form">
          <div className="form-group">
            <label>Undocking Container ID</label>
            <input
              type="text"
              value={containerId}
              onChange={(e) => setContainerId(e.target.value)}
              placeholder="e.g., contA"
            />
          </div>
          <div className="form-group">
            <label>Max Weight (kg)</label>
            <input
              type="number"
              value={maxWeight}
              onChange={(e) => setMaxWeight(parseFloat(e.target.value))}
              min="0"
              step="1"
            />
          </div>
          <button 
            onClick={handleGeneratePlan} 
            disabled={loading || !containerId}
          >
            {loading ? 'Generating...' : 'Generate Return Plan'}
          </button>
        </div>

        {returnPlan && (
          <div className="plan-details">
            <h5>Return Plan for {containerId}</h5>
            <div className="plan-stats">
              <span>Total Items: {returnPlan.returnManifest.returnItems.length}</span>
              <span>Total Weight: {returnPlan.returnManifest.totalWeight} kg</span>
            </div>
            
            <h6>Movement Steps:</h6>
            <ol>
              {returnPlan.returnPlan.map((step, index) => (
                <li key={index}>
                  Move {step.itemName} from {step.fromContainer} to {step.toContainer}
                </li>
              ))}
            </ol>

            <button 
              className="undock-button"
              onClick={handleUndocking}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Confirm Undocking'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WasteManager;