from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, models, schemas, algorithms
from app.database import SessionLocal, engine, get_db
from typing import List
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import ItemAssignmentRequest

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow all origins (for development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    return {"status": "OK"}

@app.get("/health")
async def root_health():
    return {"status": "OK"}


@app.post("/containers/", response_model=schemas.Container)
def create_container(container: schemas.ContainerCreate, db: Session = Depends(get_db)):
    return crud.create_container(db=db, container=container)

@app.get("/containers/", response_model=List[schemas.Container])
def read_containers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    containers = db.query(models.Container).offset(skip).limit(limit).all()
    return containers

@app.get("/containers/{container_id}", response_model=schemas.Container)
def read_container(container_id: str, db: Session = Depends(get_db)):
    db_container = crud.get_container(db, container_id=container_id)
    if db_container is None:
        raise HTTPException(status_code=404, detail="Container not found")
    return db_container

@app.post("/items/", response_model=schemas.Item)
def create_item(item: schemas.ItemCreate, db: Session = Depends(get_db)):
    return crud.create_item(db=db, item=item)

@app.get("/items/", response_model=List[schemas.Item])
def read_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    items = crud.get_items(db, skip=skip, limit=limit)
    return items

@app.get("/items/{item_id}", response_model=schemas.Item)
def read_item(item_id: int, db: Session = Depends(get_db)):
    db_item = crud.get_item(db, item_id=item_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_item

@app.post("/api/placement", response_model=schemas.PlacementPlan)
def placement_recommendations(
    placement_request: schemas.PlacementRequest = None,
    db: Session = Depends(get_db)
):
    """Endpoint for placement recommendations"""
    if placement_request and placement_request.item_ids:
        items = db.query(models.Item).filter(models.Item.id.in_(placement_request.item_ids)).all()
    else:
        items = db.query(models.Item).all()
    
    if placement_request and placement_request.container_ids:
        containers = db.query(models.Container).filter(
            models.Container.container_id.in_(placement_request.container_ids)
        ).all()
    else:
        containers = db.query(models.Container).all()
    
    return algorithms.optimize_placement(items, containers, db)

@app.get("/api/retrieval/{item_id}", response_model=schemas.RetrievalSteps)
def get_retrieval_steps(
    item_id: int,
    db: Session = Depends(get_db)
):
    """Endpoint for retrieval steps"""
    return algorithms.calculate_retrieval_steps(item_id, db)

@app.get("/api/waste/identify", response_model=schemas.WasteItems)
def identify_waste_items(db: Session = Depends(get_db)):
    """Endpoint for waste identification"""
    return algorithms.identify_waste(db)

@app.post("/api/waste/return-plan", response_model=schemas.ReturnPlan)
def generate_waste_return_plan(
    return_request: schemas.ReturnRequest,
    db: Session = Depends(get_db)
):
    """Endpoint for waste return planning"""
    return algorithms.generate_return_plan(
        return_request.undocking_container_id,
        return_request.max_weight,
        db
    )

@app.post("/api/simulate/day", response_model=schemas.SimulationResult)
def simulate_days(
    simulation: schemas.SimulationRequest, 
    db: Session = Depends(get_db)
):
    result = algorithms.simulate_time(
        db,
        num_days=simulation.numOfDays,
        items_used=[item.itemId for item in simulation.itemsToBeUsedPerDay]
    )
    
    return {
        "newDate": str(datetime.now().date() + timedelta(days=simulation.numOfDays)),
        "itemsExpired": result["expired_items"],
        "itemsDepletedToday": result["depleted_items"]
    }

@app.get("/api/logs", response_model=schemas.LogResponse)
def get_logs(
    start_date: str = None,
    end_date: str = None,
    item_id: int = None,
    user_id: str = None,
    action_type: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Log)
    
    if start_date:
        query = query.filter(models.Log.timestamp >= start_date)
    if end_date:
        query = query.filter(models.Log.timestamp <= end_date)
    if item_id:
        query = query.filter(models.Log.item_id == item_id)
    if user_id:
        query = query.filter(models.Log.user_id == user_id)
    if action_type:
        query = query.filter(models.Log.action_type == action_type)
    
    logs = query.order_by(models.Log.timestamp.desc()).all()
    
    return {
        "logs": [
            {
                "timestamp": log.timestamp.isoformat(),
                "user_id": log.user_id,
                "action_type": log.action_type,
                "item_id": log.item_id,
                "details": log.details
            } for log in logs
        ]
    }

@app.post("/api/assign")
def assign_item_to_container(
    assignment: schemas.ItemAssignmentRequest, 
    db: Session = Depends(get_db)
):
    print("✅ POST /api/assign called")
    """Assign an item to a container"""
    item = crud.get_item(db, assignment.itemId)
    container = crud.get_container(db, assignment.containerId)

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if not container:
        raise HTTPException(status_code=404, detail="Container not found")

    # Perform assignment (update item record)
    item.current_container = container.container_id
    db.commit()

    # Log the action
    crud.create_log(db, {
        "user_id": assignment.userId,
        "action_type": "assignment",
        "item_id": assignment.itemId,
        "details": {"assigned_to": container.container_id}
    })

    return {"message": "Item assigned successfully"}



@app.post("/api/retrieve")
def retrieve_item(
    retrieval: schemas.RetrievalRequest, 
    db: Session = Depends(get_db)
):
    item = crud.get_item(db, retrieval.itemId)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    
    crud.create_log(db, {
        "user_id": retrieval.userId,
        "action_type": "retrieval",
        "item_id": retrieval.itemId,
        "details": {
            "from_container": item.current_container,
            "timestamp": retrieval.timestamp
        }
    })
    
    
    return {"success": True}

@app.get("/")
def read_root():
    return {"message": "Cargo Stowage Management System"}
