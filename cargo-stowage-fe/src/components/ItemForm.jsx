import React, { useState } from 'react';
import { createItem } from '../services/api';

const ItemForm = ({ onItemAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    width: 0,
    depth: 0,
    height: 0,
    mass: 0,
    priority: 50,
    expiry_date: '',
    usage_limit: 1,
    preferred_zone: 'Crew Quarters'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newItem = await createItem(formData);
      onItemAdded(newItem);
      setFormData({
        name: '',
        width: 0,
        depth: 0,
        height: 0,
        mass: 0,
        priority: 50,
        expiry_date: '',
        usage_limit: 1,
        preferred_zone: 'Crew Quarters'
      });
    } catch (error) {
      console.error("Failed to create item:", error);
    }
  };

  return (
    <div className="form-card">
      <h3>Add New Cargo Item</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Item Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Width (cm)</label>
            <input
              type="number"
              value={formData.width}
              onChange={(e) => setFormData({...formData, width: parseFloat(e.target.value)})}
              min="0"
              step="0.1"
              required
            />
          </div>
          {/* Repeat for depth, height, mass */}
        </div>

        <div className="form-group">
          <label>Priority (1-100)</label>
          <input
            type="number"
            value={formData.priority}
            onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
            min="1"
            max="100"
            required
          />
        </div>

        <button type="submit">Add Item</button>
      </form>
    </div>
  );
};

export default ItemForm;