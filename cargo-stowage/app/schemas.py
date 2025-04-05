from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

class Config:
    from_attributes = True

class ContainerBase(BaseModel):
    container_id: str
    zone: str
    width: float
    depth: float
    height: float

class ContainerCreate(ContainerBase):
    pass

class Container(ContainerBase):
    id: int
    class Config:
        from_attributes = True

class ItemBase(BaseModel):
    name: str
    width: float
    depth: float
    height: float
    mass: float
    priority: int
    expiry_date: Optional[str] = None
    usage_limit: int
    remaining_uses: int
    preferred_zone: str

class ItemCreate(ItemBase):
    pass

class Item(ItemBase):
    id: int
    current_container: Optional[str] = None
    is_waste: bool = False
    waste_reason: Optional[str] = None
    class Config:
        from_attributes = True

class RetrievalRequest(BaseModel):
    item_id: int
    user_id: str
    timestamp: str

class PlacementRequest(BaseModel):
    item_ids: Optional[List[int]] = None
    container_ids: Optional[List[str]] = None

class PlacementPlan(BaseModel):
    placements: List[Dict]
    rearrangements: List[Dict]

class RetrievalSteps(BaseModel):
    steps: List[Dict]

class WasteItems(BaseModel):
    waste_items: List[Dict]

class ReturnRequest(BaseModel):
    undocking_container_id: str
    max_weight: float

class ReturnPlan(BaseModel):
    return_plan: List[Dict]
    retrieval_steps: List[Dict]
    return_manifest: Dict

class SimulationRequest(BaseModel):
    num_of_days: int
    items_to_be_used_per_day: List[Dict]

class SimulationResult(BaseModel):
    new_date: str
    items_expired: List[int]
    items_depleted_today: List[int]

class LogResponse(BaseModel):
    logs: List[Dict]


class ItemAssignmentRequest(BaseModel):
    itemId: int
    containerId: str
    userId: str