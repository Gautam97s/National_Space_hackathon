import React, { useState, useEffect } from "react";
import {
  checkHealth,
  getContainers,
  createContainer,
  getItems,
  createItem,
  getPlacementRecommendations,
  identifyWaste,
  getLogs,
  assignItemToContainer,
} from "./services/api";
import styles from "./App.module.css";

function App() {
  const [systemStatus, setSystemStatus] = useState(null);
  const [containers, setContainers] = useState([]);
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [notification, setNotification] = useState(null);

  // Form states
  const [containerForm, setContainerForm] = useState({
    container_id: "",
    zone: "Crew Quarters",
    width: 0,
    depth: 0,
    height: 0,
  });

  const [itemForm, setItemForm] = useState({
    name: "",
    mass: 0,
    priority: 50,
    expiry_date: "",
    usage_limit: 1,
    preferred_zone: "Crew Quarters",
  });

  const [assignmentData, setAssignmentData] = useState({
    itemId: null,
    containerId: "",
  });

  const handleAssignItem = async (itemId) => {
    if (!assignmentData.containerId) {
      showNotification("❌ Please select a container", "error");
      return;
    }

    try {
      await assignItemToContainer(itemId, assignmentData.containerId);
      showNotification("✅ Item assigned successfully!", "success");

      // Refresh items
      const itemsData = await getItems();
      setItems(itemsData);

      // Reset assignment
      setAssignmentData({
        itemId: " ",
        containerId: "",
      });
    } catch (error) {
      showNotification("❌ Failed to assign item", "error");
    }
  };

  // Initialize data
  useEffect(() => {
    const initialize = async () => {
      try {
        const health = await checkHealth();
        setSystemStatus(health);
        const containersData = await getContainers();
        setContainers(containersData);
        const itemsData = await getItems();
        setItems(itemsData);
      } catch (error) {
        showNotification("⚠️ Failed to load data", "error");
      }
    };
    initialize();
  }, []);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleContainerSubmit = async (e) => {
    e.preventDefault();
    try {
      const newContainer = await createContainer(containerForm);
      setContainers([...containers, newContainer]);
      setContainerForm({
        container_id: "",
        zone: "Crew Quarters",
        width: 0,
        depth: 0,
        height: 0,
      });
      showNotification("🚀 Container added successfully!", "success");
    } catch (error) {
      showNotification("❌ Failed to add container", "error");
    }
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    try {
      const newItem = await createItem(itemForm);
      setItems([...items, newItem]);
      setItemForm({
        name: "",
        mass: 0,
        priority: 50,
        expiry_date: "",
        usage_limit: 1,
        preferred_zone: "Crew Quarters",
      });
      showNotification("📦 Item added successfully!", "success");
    } catch (error) {
      showNotification("❌ Failed to add item", "error");
    }
  };

  return (
    <div className={styles.app}>
      {/* Funky Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>🚀 ISS Cargo Stowage</h1>
        <div className={styles.status}>
          {systemStatus?.status === "OK" ? (
            <span className={styles.connected}>🟢 Connected</span>
          ) : (
            <span className={styles.error}>🔴 Offline</span>
          )}
        </div>
      </header>

      {/* Funky Navigation */}
      <nav className={styles.nav}>
        <button
          className={`${styles.navButton} ${
            activeTab === "dashboard" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("dashboard")}
        >
          📊 Dashboard
        </button>
        <button
          className={`${styles.navButton} ${
            activeTab === "containers" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("containers")}
        >
          📦 Containers
        </button>
        <button
          className={`${styles.navButton} ${
            activeTab === "items" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("items")}
        >
          📋 Items
        </button>
        <button
          className={`${styles.navButton} ${
            activeTab === "waste" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("waste")}
        >
          ♻️ Waste
        </button>
      </nav>

      {/* Notification */}
      {notification && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          {notification.message}
        </div>
      )}

      <main className={styles.main}>
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className={styles.dashboard}>
            <div className={styles.stats}>
              <div className={styles.statCard}>
                <h3>Containers</h3>
                <p className={styles.statValue}>{containers.length}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Items</h3>
                <p className={styles.statValue}>{items.length}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Waste</h3>
                <p className={styles.statValue}>
                  {items.filter((i) => i.status === "waste").length}
                </p>
              </div>
            </div>

            <div className={styles.placement}>
              <button
                className={styles.placementButton}
                onClick={async () => {
                  try {
                    await getPlacementRecommendations();
                    showNotification(
                      "✨ Generated placement recommendations!",
                      "success"
                    );
                  } catch (error) {
                    showNotification(
                      "❌ Failed to generate placements",
                      "error"
                    );
                  }
                }}
              >
                🧩 Generate Placement
              </button>
            </div>
          </div>
        )}

        {/* Containers Tab */}
        {activeTab === "containers" && (
          <div className={styles.tabContent}>
            <h2 className={styles.tabTitle}>Add New Container</h2>
            <form onSubmit={handleContainerSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Container ID</label>
                <input
                  type="text"
                  value={containerForm.container_id}
                  onChange={(e) =>
                    setContainerForm({
                      ...containerForm,
                      container_id: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Width (cm)</label>
                  <input
                    type="number"
                    value={containerForm.width}
                    onChange={(e) =>
                      setContainerForm({
                        ...containerForm,
                        width: parseFloat(e.target.value),
                      })
                    }
                    min="0"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Depth (cm)</label>
                  <input
                    type="number"
                    value={containerForm.depth}
                    onChange={(e) =>
                      setContainerForm({
                        ...containerForm,
                        depth: parseFloat(e.target.value),
                      })
                    }
                    min="0"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Height (cm)</label>
                  <input
                    type="number"
                    value={containerForm.height}
                    onChange={(e) =>
                      setContainerForm({
                        ...containerForm,
                        height: parseFloat(e.target.value),
                      })
                    }
                    min="0"
                    required
                  />
                </div>
              </div>

              <button type="submit" className={styles.submitButton}>
                Add Container
              </button>
            </form>

            <h2 className={styles.tabTitle}>All Containers</h2>
            <div className={styles.containerGrid}>
              {containers.map((container) => (
                <div
                  key={container.container_id}
                  className={styles.containerCard}
                >
                  <h3>{container.container_id}</h3>
                  <p>Zone: {container.zone}</p>
                  <p>
                    {container.width} × {container.depth} × {container.height}{" "}
                    cm
                  </p>
                  <div className={styles.capacityBar}>
                    <div
                      className={styles.capacityFill}
                      style={{ width: `${container.used_capacity || 0}%` }}
                    ></div>
                  </div>
                  <p>{container.used_capacity || 0}% full</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Items Tab */}
        {activeTab === "items" && (
          <div className={styles.tabContent}>
            <h2 className={styles.tabTitle}>Add New Item</h2>
            <form onSubmit={handleItemSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Item Name</label>
                <input
                  type="text"
                  value={itemForm.name}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Mass (kg)</label>
                  <input
                    type="number"
                    value={itemForm.mass}
                    onChange={(e) =>
                      setItemForm({
                        ...itemForm,
                        mass: parseFloat(e.target.value),
                      })
                    }
                    min="0"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Priority (1-100)</label>
                  <input
                    type="number"
                    value={itemForm.priority}
                    onChange={(e) =>
                      setItemForm({
                        ...itemForm,
                        priority: parseInt(e.target.value),
                      })
                    }
                    min="1"
                    max="100"
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    value={itemForm.expiry_date}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, expiry_date: e.target.value })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Usage Limit</label>
                  <input
                    type="number"
                    value={itemForm.usage_limit}
                    onChange={(e) =>
                      setItemForm({
                        ...itemForm,
                        usage_limit: parseInt(e.target.value),
                      })
                    }
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Preferred Zone</label>
                <select
                  value={itemForm.preferred_zone}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, preferred_zone: e.target.value })
                  }
                >
                  <option value="Crew Quarters">Crew Quarters</option>
                  <option value="Airlock">Airlock</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Medical Bay">Medical Bay</option>
                </select>
              </div>

              <button type="submit" className={styles.submitButton}>
                Add Item
              </button>
            </form>

            <h2 className={styles.tabTitle}>All Items</h2>
            <div className={styles.itemTable}>
              <div className={styles.tableHeader}>
                <div>Name</div>
                <div>Mass</div>
                <div>Priority</div>
                <div>Container</div>
                <div>Action</div>
              </div>
              {items.map((item) => (
                <div key={item.id} className={styles.tableRow}>
                  <div>{item.name}</div>
                  <div>{item.mass} kg</div>
                  <div className={styles[`priority${item.priority}`]}>
                    {item.priority}
                  </div>
                  <div>{item.container_id || "Unassigned"}</div>
                  <div>
                    <button
                      className={styles.assignButton}
                      onClick={() =>
                        setAssignmentData({
                          itemId: item.id,
                          containerId: item.container_id || "",
                        })
                      }
                    >
                      {item.container_id ? "Reassign" : "Assign"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Assignment Modal */}
            {assignmentData.itemId && (
              <div className={styles.modalOverlay}>
                <div className={styles.modal}>
                  <h3>Assign Item to Container</h3>
                  <div className={styles.formGroup}>
                    <label>Select Container</label>
                    <select
                      value={assignmentData.containerId}
                      onChange={(e) =>
                        setAssignmentData({
                          ...assignmentData,
                          containerId: e.target.value,
                        })
                      }
                    >
                      <option value="">Select container</option>
                      {containers.map((container) => (
                        <option
                          key={container.container_id}
                          value={container.container_id}
                        >
                          {container.container_id} ({container.zone})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.modalButtons}>
                    <button
                      className={styles.cancelButton}
                      onClick={() =>
                        setAssignmentData({
                          itemId: null,
                          containerId: "",
                        })
                      }
                    >
                      Cancel
                    </button>
                    <button
                      className={styles.confirmButton}
                      onClick={() => handleAssignItem(assignmentData.itemId)}
                    >
                      Confirm Assignment
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Waste Tab */}
        {activeTab === "waste" && (                  
          <div className={styles.tabContent}>
            <h2 className={styles.tabTitle}>Waste Management</h2>
            <button
              className={styles.wasteButton}
              onClick={async () => {
                try {
                  const waste = await identifyWaste();
                  showNotification(
                    `♻️ Found ${waste.wasteItems.length} waste items`,
                    "success"
                  );
                } catch (error) {
                  showNotification("❌ Failed to identify waste", "error");
                }
              }}
            >
              🔍 Identify Waste
            </button>

            <div className={styles.wasteList}>
              {items
                .filter((i) => i.status === "waste")
                .map((item) => (
                  <div key={item.id} className={styles.wasteItem}>
                    <h3>{item.name}</h3>
                    <p>Expired: {item.expiry_date}</p>
                    <p>Container: {item.container_id}</p>
                    <button className={styles.disposeButton}>🗑️ Dispose</button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
