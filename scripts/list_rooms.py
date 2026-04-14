#!/usr/bin/env python3
"""
List all rooms
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from sqlmodel import Session, select
from app.models import Room
from app.db import rental_engine

def list_rooms():
    with Session(rental_engine) as session:
        stmt = select(Room)
        rooms = session.exec(stmt).all()
        
        if not rooms:
            print("No rooms found")
            return
        
        print(f"Found {len(rooms)} rooms:\n")
        for room in rooms:
            print(f"  room_id: {room.room_id}, property_id: {room.property_id}, room_number: {room.room_number}, is_active: {room.is_active}")

if __name__ == "__main__":
    try:
        list_rooms()
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
