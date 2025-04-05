from sqlalchemy.orm import Session
from . import models, schemas

def get_container(db: Session, container_id: str):
    return db.query(models.Container).filter(models.Container.container_id == container_id).first()

def get_containers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Container).offset(skip).limit(limit).all()

def create_container(db: Session, container: schemas.ContainerCreate):
    db_container = models.Container(**container.dict())
    db.add(db_container)
    db.commit()
    db.refresh(db_container)
    return db_container

def get_item(db: Session, item_id: int):
    return db.query(models.Item).filter(models.Item.id == item_id).first()

def get_items(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Item).offset(skip).limit(limit).all()

def create_item(db: Session, item: schemas.ItemCreate):
    db_item = models.Item(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def create_log(db: Session, log_data: dict):
    db_log = models.Log(**log_data)
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log