#!/usr/bin/env python3
"""
Cancel all active bookings for room g3
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from sqlmodel import Session, select
from app.models import Booking, Room
from app.db import rental_engine

def cancel_g3_bookings():
    with Session(rental_engine) as session:
        # Find room G3
        stmt = select(Room).where(Room.room_number == "G3")
        room = session.exec(stmt).first()
        
        if not room:
            print("❌ Room 'G3' not found")
            return False
        
        print(f"✓ Found room 'G3' (room_id: {room.room_id})")
        
        # Find active bookings for this room
        stmt = select(Booking).where(
            (Booking.room_id == room.room_id) & 
            (Booking.booking_status == "Active")
        )
        bookings = session.exec(stmt).all()
        
        if not bookings:
            print("ℹ No active bookings found for room 'G3'")
            return True
        
        print(f"✓ Found {len(bookings)} active booking(s) for room 'G3'")
        
        # Cancel them
        for booking in bookings:
            booking.booking_status = "Cancelled"
            session.add(booking)
            print(f"  → Cancelling booking {booking.booking_id} (customer {booking.customer_id})")
        
        session.commit()
        print(f"\n✓ Successfully cancelled {len(bookings)} booking(s)")
        return True

if __name__ == "__main__":
    try:
        cancel_g3_bookings()
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
