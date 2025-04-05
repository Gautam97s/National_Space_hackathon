import React, { useState } from 'react';
import { getRetrievalSteps, retrieveItem } from '../services/api';

const RetrievalPath = ({ items }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [retrievalSteps, setRetrievalSteps] = useState([]);
  const [userId, setUserId] = useState('astronaut-1');

  const handleItemSelect = async (itemId) => {
    try {
      const steps = await getRetrievalSteps(itemId);
      setSelectedItem(items.find(item => item.id === itemId));
      setRetrievalSteps(steps);
    } catch (error) {
      console.error("Failed to get retrieval steps:", error);
    }
  };

  const handleRetrieve = async () => {
    if (!selectedItem) return;
    try {
      await retrieveItem(selectedItem.id, userId);
      alert(`Item ${selectedItem.name} retrieved successfully!`);
    } catch (error) {
      console.error("Retrieval failed:", error);
    }
  };

  return (
    <div className="retrieval-card">
      <h3>Item Retrieval System</h3>
      
      <div className="item-selector">
        <select onChange={(e) => handleItemSelect(parseInt(e.target.value))}>
          <option value="">Select an item</option>
          {items.map(item => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      </div>

      {selectedItem && (
        <div className="retrieval-details">
          <h4>Retrieval Steps for {selectedItem.name}</h4>
          <ol>
            {retrievalSteps.map((step, index) => (
              <li key={index}>{step.action}: {step.itemName}</li>
            ))}
          </ol>
          
          <div className="retrieval-actions">
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Astronaut ID"
            />
            <button onClick={handleRetrieve}>Confirm Retrieval</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetrievalPath;