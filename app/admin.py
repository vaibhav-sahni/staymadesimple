from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from .db import get_rental_session
from .deps import require_role
from .models import Property, Owner
from .schemas import PropertyRead
import logging, traceback

router = APIRouter(prefix="/admin", tags=["admin"])
logger = logging.getLogger(__name__)


@router.get("/properties", response_model=List[PropertyRead])
def admin_list_properties(session: Session = Depends(get_rental_session), current_user=Depends(require_role("Admin"))):
    try:
        props = session.exec(select(Property)).all()
        results = [PropertyRead(
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
            is_full=False,
        ) for p in props]
        return results
    except Exception as exc:
        tb = traceback.format_exc()
        logger.exception("admin_list_properties failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Internal server error\n{tb}")


@router.get("/properties/unverified", response_model=List[PropertyRead])
def admin_list_unverified_properties(session: Session = Depends(get_rental_session), current_user=Depends(require_role("Admin"))):
    try:
        # return properties that are pending verification
        props = session.exec(select(Property).where(Property.verification_status == 'Pending')).all()
        results = [PropertyRead(
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
            is_full=False,
        ) for p in props]
        return results
    except Exception as exc:
        tb = traceback.format_exc()
        logger.exception("admin_list_unverified_properties failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Internal server error\n{tb}")


@router.put("/properties/{property_id}/verify", status_code=status.HTTP_200_OK)
def admin_verify_property(property_id: int, status: str = "Verified", session: Session = Depends(get_rental_session), current_user=Depends(require_role("Admin"))):
    try:
        if status not in ("Verified", "Rejected", "Pending"):
            raise HTTPException(status_code=400, detail="status must be one of Verified, Rejected, Pending")
        prop = session.get(Property, property_id)
        if not prop:
            raise HTTPException(status_code=404, detail="Property not found")
        prop.verification_status = status
        try:
            session.add(prop)
            session.commit()
            session.refresh(prop)
        except Exception:
            session.rollback()
            raise
        return {"property_id": property_id, "verification_status": status}
    except HTTPException:
        raise
    except Exception as exc:
        tb = traceback.format_exc()
        logger.exception("admin_verify_property failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Internal server error\n{tb}")


@router.delete("/properties/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_property(property_id: int, session: Session = Depends(get_rental_session), current_user=Depends(require_role("Admin"))):
    try:
        prop = session.get(Property, property_id)
        if not prop:
            raise HTTPException(status_code=404, detail="Property not found")
        try:
            session.delete(prop)
            session.commit()
        except Exception:
            session.rollback()
            raise
        return None
    except HTTPException:
        raise
    except Exception as exc:
        tb = traceback.format_exc()
        logger.exception("admin_delete_property failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Internal server error\n{tb}")


@router.get("/owners")
def admin_list_owners(session: Session = Depends(get_rental_session), current_user=Depends(require_role("Admin"))):
    try:
        rows = session.exec(select(Owner)).all()
        return rows
    except Exception as exc:
        tb = traceback.format_exc()
        logger.exception("admin_list_owners failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Internal server error\n{tb}")


@router.get("/owners/unverified")
def admin_list_unverified_owners(session: Session = Depends(get_rental_session), current_user=Depends(require_role("Admin"))):
    try:
        owners = session.exec(select(Owner).where(Owner.verification_status == 'Pending')).all()
        return owners
    except Exception as exc:
        tb = traceback.format_exc()
        logger.exception("admin_list_unverified_owners failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Internal server error\n{tb}")


@router.put("/owners/{owner_id}/verify")
def admin_verify_owner(owner_id: int, status: str = "Verified", session: Session = Depends(get_rental_session), current_user=Depends(require_role("Admin"))):
    try:
        if status not in ("Verified", "Rejected", "Pending"):
            raise HTTPException(status_code=400, detail="status must be one of Verified, Rejected, Pending")
        owner = session.get(Owner, owner_id)
        if not owner:
            raise HTTPException(status_code=404, detail="Owner not found")
        owner.verification_status = status
        try:
            session.add(owner)
            session.commit()
            session.refresh(owner)
        except Exception:
            session.rollback()
            raise
        return {"owner_id": owner_id, "verification_status": status}
    except HTTPException:
        raise
    except Exception as exc:
        tb = traceback.format_exc()
        logger.exception("admin_verify_owner failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Internal server error\n{tb}")


@router.delete("/owners/{owner_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_owner(owner_id: int, session: Session = Depends(get_rental_session), current_user=Depends(require_role("Admin"))):
    try:
        owner = session.get(Owner, owner_id)
        if not owner:
            raise HTTPException(status_code=404, detail="Owner not found")
        try:
            session.delete(owner)
            session.commit()
        except Exception:
            session.rollback()
            raise
        return None
    except HTTPException:
        raise
    except Exception as exc:
        tb = traceback.format_exc()
        logger.exception("admin_delete_owner failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Internal server error\n{tb}")
