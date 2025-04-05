import React, { useState } from 'react';
import { createContainer } from '../services/api';

const ContainerForm = ({ onContainerAdded }) => {
  const [formData, setFormData] = useState({
    container_id: '',
    zone: 'Crew Quarters',
    width: 0,
    depth: 0,
    height: 0
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newContainer = await createContainer(formData);
      onContainerAdded(newContainer);
      setFormData({
        container_id: '',
        zone: 'Crew Quarters',
        width: 0,
        depth: 0,
        height: 0
      });
    } catch (error) {
      console.error("Container creation failed:", error);
    }
  };

  return (
    <div className="form-card">
      <h3>Add Storage Container</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Container ID</label>
          <input
            type="text"
            value={formData.container_id}
            onChange={(e) => setFormData({...formData, container_id: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Zone</label>
          <select
            value={formData.zone}
            onChange={(e) => setFormData({...formData, zone: e.target.value})}
          >
            <option value="Crew Quarters">Crew Quarters</option>
            <option value="Airlock">Airlock</option>
            <option value="Laboratory">Laboratory</option>
            <option value="Medical Bay">Medical Bay</option>
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Width (cm)</label>
            <input
              type="number"
              value={formData.width}
              onChange={(e) => setFormData({...formData, width: parseFloat(e.target.value)})}
              min="0"
              step="1"
              required
            />
          </div>
          <div className="form-group">
            <label>Depth (cm)</label>
            <input
              type="number"
              value={formData.depth}
              onChange={(e) => setFormData({...formData, depth: parseFloat(e.target.value)})}
              min="0"
              step="1"
              required
            />
          </div>
          <div className="form-group">
            <label>Height (cm)</label>
            <input
              type="number"
              value={formData.height}
              onChange={(e) => setFormData({...formData, height: parseFloat(e.target.value)})}
              min="0"
              step="1"
              required
            />
          </div>
        </div>

        <button type="submit">Add Container</button>
      </form>
    </div>
  );
};

export default ContainerForm;