from sqlmodel import create_engine, Session
from .core.config import settings


# Engine for auth_db (separate logical DB)
auth_engine = create_engine(settings.AUTH_DATABASE_URL, echo=False)

# Engine for rental_db (properties, rooms, bookings)
rental_engine = create_engine(settings.RENTAL_DATABASE_URL, echo=False)


def get_auth_session():
    session = Session(auth_engine)
    try:
        yield session
    finally:
        session.close()


def get_rental_session():
    session = Session(rental_engine)
    try:
        yield session
    finally:
        session.close()
