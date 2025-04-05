import React, { useState } from 'react';
import { getPlacementRecommendations } from '../services/api';

const PlacementVisualizer = ({ items, containers }) => {
  const [placementPlan, setPlacementPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const generatePlacement = async () => {
    setLoading(true);
    try {
      const plan = await getPlacementRecommendations(
        items.map(item => item.id),
        containers.map(container => container.container_id)
      );
      setPlacementPlan(plan);
    } catch (error) {
      console.error("Placement generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="visualization-card">
      <div className="section-header">
        <h3>Optimal Placement Plan</h3>
        <button 
          onClick={generatePlacement} 
          disabled={loading || items.length === 0 || containers.length === 0}
        >
          {loading ? 'Calculating...' : 'Generate Plan'}
        </button>
      </div>

      {placementPlan && (
        <div className="placement-details">
          <h4>Placement Recommendations</h4>
          <div className="placement-items">
            {placementPlan.placements.map((placement, index) => (
              <div key={index} className="placement-item">
                <span className="item-name">
                  {items.find(i => i.id === placement.itemId)?.name || placement.itemId}
                </span>
                <span className="container">
                  {containers.find(c => c.container_id === placement.containerId)?.container_id || placement.containerId}
                </span>
                <span className="coordinates">
                  ({placement.position.startCoordinates.width}, 
                  {placement.position.startCoordinates.depth}, 
                  {placement.position.startCoordinates.height})
                </span>
              </div>
            ))}
          </div>

          {placementPlan.rearrangements?.length > 0 && (
            <>
              <h4>Required Rearrangements</h4>
              <ol className="rearrangement-steps">
                {placementPlan.rearrangements.map((step, index) => (
                  <li key={index}>
                    {step.action.toUpperCase()}: {step.itemId} from {step.fromContainer} to {step.toContainer}
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PlacementVisualizer;