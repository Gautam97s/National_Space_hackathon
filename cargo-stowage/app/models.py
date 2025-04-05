from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, JSON  # Added DateTime and JSON
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime  
from .database import Base

class Item(Base):
    __tablename__ = "items"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    width = Column(Float)
    depth = Column(Float)
    height = Column(Float)
    mass = Column(Float)
    priority = Column(Integer)
    expiry_date = Column(String, nullable=True)
    usage_limit = Column(Integer)
    remaining_uses = Column(Integer)
    preferred_zone = Column(String)
    current_container = Column(String, nullable=True)
    is_waste = Column(Boolean, default=False)
    waste_reason = Column(String, nullable=True)

class Container(Base):
    __tablename__ = "containers"
    
    id = Column(Integer, primary_key=True, index=True)
    container_id = Column(String, unique=True, index=True)
    zone = Column(String)
    width = Column(Float)
    depth = Column(Float)
    height = Column(Float)

class Log(Base):
    __tablename__ = "logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user_id = Column(String, nullable=True)  
    action_type = Column(String)  
    item_id = Column(Integer, nullable=True)
    details = Column(JSON)  