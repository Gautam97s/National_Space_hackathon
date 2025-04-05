import React, { useState, useEffect } from 'react';
import { getItems } from '../services/api';
import ItemForm from '../components/ItemForm';

const InventoryPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const itemsData = await getItems();
        setItems(itemsData);
      } catch (error) {
        console.error("Failed to fetch items:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleItemAdded = (newItem) => {
    setItems([...items, newItem]);
  };

  if (loading) return <div>Loading inventory...</div>;

  return (
    <div className="page-container">
      <h2>Cargo Inventory Management</h2>
      
      <div className="content-grid">
        <div className="form-section">
          <ItemForm onItemAdded={handleItemAdded} />
        </div>
        
        <div className="list-section">
          <h3>Current Inventory ({items.length} items)</h3>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Dimensions</th>
                <th>Priority</th>
                <th>Zone</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.width}x{item.depth}x{item.height} cm</td>
                  <td>{item.priority}</td>
                  <td>{item.preferred_zone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;