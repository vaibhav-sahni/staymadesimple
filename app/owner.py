from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from .db import get_rental_session
from .models import Property, UserAuth
from .schemas import PropertyCreate, PropertyRead
from .deps import require_role, get_current_user
import logging
import traceback

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/owner", tags=["owner"])


@router.post("/properties", response_model=PropertyRead)
def create_property(
    payload: PropertyCreate,
    current_user: UserAuth = Depends(require_role("Owner")),
    session: Session = Depends(get_rental_session),
):
    try:
        # resolve owner_id in rental_db: auth.user_id -> customers.user_id -> owner.owner_id
        from .models import Customer, Owner

        cust = session.exec(select(Customer).where(Customer.user_id == current_user.user_id)).first()
        if not cust:
            raise HTTPException(status_code=404, detail="Customer profile not found in rental DB")
        owner = session.exec(select(Owner).where(Owner.customer_id == cust.customer_id)).first()
        if not owner:
            raise HTTPException(status_code=403, detail="User is not an owner")

        prop = Property(
            owner_id=owner.owner_id,
            property_description=payload.property_description,
            room_description=payload.room_description,
            property_type=payload.property_type,
            city=payload.city,
            address=payload.address,
            google_maps_link=payload.google_maps_link,
        )
        session.add(prop)
        session.commit()
        session.refresh(prop)
        return PropertyRead(
            property_id=prop.property_id,
            owner_id=prop.owner_id,
            property_description=prop.property_description,
            room_description=prop.room_description,
            property_type=prop.property_type,
            city=prop.city,
            address=prop.address,
            google_maps_link=prop.google_maps_link,
            verification_status=prop.verification_status,
            average_rating=prop.average_rating,
        )
    except Exception as exc:
        tb = traceback.format_exc()
        logger.exception("create_property failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Internal server error (see server logs)\n{tb}")


@router.get("/properties", response_model=list[PropertyRead])
def list_my_properties(
    current_user: UserAuth = Depends(require_role("Owner")), session: Session = Depends(get_rental_session)
):
    try:
        # resolve owner_id for current user
        from .models import Customer, Owner

        cust = session.exec(select(Customer).where(Customer.user_id == current_user.user_id)).first()
        if not cust:
            raise HTTPException(status_code=404, detail="Customer profile not found in rental DB")
        owner = session.exec(select(Owner).where(Owner.customer_id == cust.customer_id)).first()
        if not owner:
            raise HTTPException(status_code=403, detail="User is not an owner")

        stmt = select(Property).where(Property.owner_id == owner.owner_id)
        props = session.exec(stmt).all()
        return [PropertyRead(
            property_id=p.property_id,
            owner_id=p.owner_id,
            property_description=p.property_description,
            room_description=p.room_description,
            property_type=p.property_type,
            city=p.city,
            address=p.address,
            google_maps_link=p.google_maps_link,
            verification_status=p.verification_status,
            average_rating=p.average_rating,
        ) for p in props]
    except Exception as exc:
        tb = traceback.format_exc()
        logger.exception("list_my_properties failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Internal server error (see server logs)\n{tb}")
