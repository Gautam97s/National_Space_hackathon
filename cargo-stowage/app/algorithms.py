from typing import List, Dict, Optional, Tuple
from datetime import date
from sqlalchemy.orm import Session
from . import models  # Add this import
from .database import get_db
from fastapi import Depends
from datetime import datetime, timedelta
from sqlalchemy import and_

def get_rotations(item: models.Item) -> List[Tuple[float, float, float]]:
    """Generate all possible rotations of an item"""
    dimensions = [
        (item.width, item.depth, item.height),
        (item.width, item.height, item.depth),
        (item.depth, item.width, item.height),
        (item.depth, item.height, item.width),
        (item.height, item.width, item.depth),
        (item.height, item.depth, item.width)
    ]
    return list(set(dimensions))

def optimize_placement(items: List[models.Item], containers: List[models.Container], db: Session) -> Dict:
    """Optimize item placement in containers"""
    placements = []
    for item in items:
        for container in containers:
            if (container.width >= item.width and 
                container.depth >= item.depth and 
                container.height >= item.height):
                placements.append({
                    "itemId": item.id,
                    "containerId": container.container_id,
                    "position": {
                        "startCoordinates": {"width": 0, "depth": 0, "height": 0},
                        "endCoordinates": {
                            "width": item.width,
                            "depth": item.depth,
                            "height": item.height
                        }
                    },
                    "rotation": [item.width, item.depth, item.height]
                })
                item.current_container = container.container_id
                db.add(item)
                db.commit()
                break
    return {"placements": placements, "rearrangements": []}

def assign_items_to_containers(db: Session) -> Dict:
    """Assign unplaced items to available containers based on space and priority"""
    items = db.query(models.Item).filter(models.Item.current_container == None).order_by(models.Item.priority.desc()).all()
    containers = db.query(models.Container).all()
    placements = []

    for item in items:
        item_rotations = get_rotations(item)
        for container in containers:
            for rot in item_rotations:
                if rot[0] <= container.width and rot[1] <= container.depth and rot[2] <= container.height:
                    placements.append({
                        "itemId": item.id,
                        "containerId": container.container_id,
                        "rotation": rot,
                        "position": {
                            "startCoordinates": {"width": 0, "depth": 0, "height": 0},
                            "endCoordinates": {
                                "width": rot[0],
                                "depth": rot[1],
                                "height": rot[2]
                            }
                        }
                    })
                    item.current_container = container.container_id
                    db.add(item)
                    db.commit()
                    break
            else:
                continue
            break

    return {"assigned": placements}

def calculate_retrieval_steps(item_id: int, db: Session) -> Dict:
    """Calculate steps to retrieve an item"""
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item:
        return {"steps": []}

    return {
        "steps": [
            {
                "step": 1,
                "action": "retrieve",
                "itemId": item.id,
                "itemName": item.name
            }
        ]
    }

def identify_waste(db: Session) -> Dict:
    """Identify waste items"""
    waste_items = []
    for item in db.query(models.Item).all():
        if item.is_waste:
            waste_items.append({
                "itemId": item.id,
                "name": item.name,
                "reason": item.waste_reason,
                "containerId": item.current_container,
                "position": {
                    "startCoordinates": {"width": 0, "depth": 0, "height": 0},
                    "endCoordinates": {
                        "width": item.width,
                        "depth": item.depth,
                        "height": item.height
                    }
                }
            })
    return {"waste_items": waste_items}

def generate_return_plan(undocking_container_id: str, max_weight: float, db: Session) -> Dict:
    """Generate plan to return waste"""
    waste_items = []
    total_weight = 0.0
    for item in db.query(models.Item).filter(models.Item.is_waste == True).all():
        if total_weight + item.mass <= max_weight:
            waste_items.append({
                "itemId": item.id,
                "name": item.name,
                "reason": item.waste_reason,
                "fromContainer": item.current_container,
                "toContainer": undocking_container_id
            })
            total_weight += item.mass

    return {
        "return_plan": waste_items,
        "retrieval_steps": [],
        "return_manifest": {
            "undocking_container_id": undocking_container_id,
            "returnItems": [{"itemId": i["itemId"], "name": i["name"], "reason": i["reason"]} for i in waste_items],
            "totalVolume": sum(item.width * item.depth * item.height for item in waste_items),
            "totalWeight": total_weight
        }
    }

def simulate_time(db: Session, num_days: int = 1, items_used: List[int] = None):
    """
    Simulate time passage and update item statuses.
    Args:
        num_days: Number of days to simulate
        items_used: List of item IDs used during this period
    """
    current_date = datetime.now().date()

    if items_used:
        for item_id in items_used:
            item = db.query(models.Item).filter(models.Item.id == item_id).first()
            if item:
                item.remaining_uses -= 1
                if item.remaining_uses <= 0:
                    item.is_waste = True
                    item.waste_reason = "Out of uses"

    expired_items = db.query(models.Item).filter(
        and_(
            models.Item.expiry_date.isnot(None),
            models.Item.expiry_date <= str(current_date + timedelta(days=num_days))
        )
    ).all()

    for item in expired_items:
        item.is_waste = True
        item.waste_reason = "Expired"

    db.commit()

    return {
        "expired_items": [item.id for item in expired_items],
        "depleted_items": [item_id for item_id in items_used if 
                          db.query(models.Item).filter(
                              models.Item.id == item_id,
                              models.Item.remaining_uses <= 0
                          ).first()]
    }
