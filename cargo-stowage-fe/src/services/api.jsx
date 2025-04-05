const API_BASE = 'http://localhost:8000';

export const checkHealth = async () => {
  const response = await fetch(`${API_BASE}/api/health`);
  return response.json();
};

export const getContainers = async () => {
  const response = await fetch(`${API_BASE}/containers/`);
  return response.json();
};

export const createContainer = async (containerData) => {
  const response = await fetch(`${API_BASE}/containers/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(containerData),
  });
  return response.json();
};

export const getItems = async () => {
  const response = await fetch(`${API_BASE}/items/`);
  return response.json();
};

export const createItem = async (itemData) => {
  const response = await fetch(`${API_BASE}/items/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(itemData),
  });
  return response.json();
};

export const getPlacementRecommendations = async (itemIds = [], containerIds = []) => {
  const response = await fetch(`${API_BASE}/api/placement`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      item_ids: itemIds,
      container_ids: containerIds
    }),
  });
  return response.json();
};

export const getRetrievalSteps = async (itemId) => {
  const response = await fetch(`${API_BASE}/api/retrieval/${itemId}`);
  return response.json();
};

export const identifyWaste = async () => {
  const response = await fetch(`${API_BASE}/api/waste/identify`);
  return response.json();
};

export const generateReturnPlan = async (containerId, maxWeight) => {
  const response = await fetch(`${API_BASE}/api/waste/return-plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      undocking_container_id: containerId,
      max_weight: maxWeight
    }),
  });
  return response.json();
};

export const simulateDays = async (numDays, itemsUsed) => {
  const response = await fetch(`${API_BASE}/api/simulate/day`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      numOfDays: numDays,
      itemsToBeUsedPerDay: itemsUsed.map(id => ({ itemId: id }))
    }),
  });
  return response.json();
};

export const getLogs = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`${API_BASE}/api/logs?${params}`);
  return response.json();
};

export const retrieveItem = async (itemId, userId) => {
  const response = await fetch(`${API_BASE}/api/retrieve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      itemId: itemId,
      userId: userId,
      timestamp: new Date().toISOString()
    }),
  });
  return response.json();
};

// ✅ Must be a POST call
export const assignItemToContainer = async (itemId, containerId) => {
  const response = await fetch(`${API_BASE}/api/assign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      itemId,
      containerId,
      userId: "admin", // or dynamic user ID
    }),
  });

  return response.json();
};

