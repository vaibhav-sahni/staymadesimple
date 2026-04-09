import argparse
import threading
import time
import uuid

import requests


def signup(api_url: str, email: str, password: str):
    url = f"{api_url.rstrip('/')}/signup"
    payload = {
        "email": email,
        "password": password,
        "role": "User",
        "full_name": "Race Demo User"
    }
    res = requests.post(url, json=payload)
    if not res.ok:
        raise RuntimeError(f"Signup failed: {res.status_code} {res.text}")
    return res.json()["access_token"]


def book_room(api_url: str, token: str, property_id: int, room_id: int, start_date: str, end_date: str, output: list, index: int):
    url = f"{api_url.rstrip('/')}/properties/{property_id}/bookings"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    payload = {
        "room_id": room_id,
        "start_date": start_date,
        "end_date": end_date
    }
    try:
        res = requests.post(url, json=payload, headers=headers, timeout=20)
        output[index] = (res.status_code, res.text)
    except Exception as exc:
        output[index] = (None, str(exc))


def get_properties(api_url: str):
    url = f"{api_url.rstrip('/')}/properties?limit=10"
    res = requests.get(url, timeout=20)
    if not res.ok:
        raise RuntimeError(f"Cannot fetch properties: {res.status_code} {res.text}")
    return res.json()


def get_rooms(api_url: str, property_id: int):
    url = f"{api_url.rstrip('/')}/properties/{property_id}/rooms"
    res = requests.get(url, timeout=20)
    if not res.ok:
        raise RuntimeError(f"Cannot fetch rooms for property {property_id}: {res.status_code} {res.text}")
    return res.json()


def choose_property_and_room(api_url: str, property_id: int | None, room_id: int | None):
    if property_id and room_id:
        return property_id, room_id

    properties = get_properties(api_url)
    if not properties:
        raise RuntimeError("No properties returned by the API. Create a property first.")

    if property_id is None:
        chosen_property = properties[0]
        property_id = chosen_property.get("property_id")

    rooms = get_rooms(api_url, property_id)
    if not rooms:
        raise RuntimeError(f"Property {property_id} has no rooms.")

    if room_id is None:
        room_id = rooms[0].get("room_id")

    return property_id, room_id


def main():
    parser = argparse.ArgumentParser(description="Demo race condition handling for booking creation.")
    parser.add_argument("--api", default="http://localhost:8000", help="Base API URL")
    parser.add_argument("--property", type=int, help="Property ID to book")
    parser.add_argument("--room", type=int, help="Room ID to book")
    parser.add_argument("--start", default="2026-05-01", help="Booking start date (YYYY-MM-DD)")
    parser.add_argument("--end", default="2026-05-05", help="Booking end date (YYYY-MM-DD)")
    parser.add_argument("--password", default="RaceDemo!23", help="Password for the demo signup user")
    args = parser.parse_args()

    property_id, room_id = choose_property_and_room(args.api, args.property, args.room)
    print(f"Using property_id={property_id}, room_id={room_id}")

    email = f"race-demo+{uuid.uuid4().hex[:8]}@example.com"
    print("Signing up demo user:", email)
    token = signup(args.api, email, args.password)
    print("Signup succeeded, token acquired")

    results = [None, None]
    threads = [
        threading.Thread(target=book_room, args=(args.api, token, property_id, room_id, args.start, args.end, results, 0)),
        threading.Thread(target=book_room, args=(args.api, token, property_id, room_id, args.start, args.end, results, 1)),
    ]

    for t in threads:
        t.start()
    for t in threads:
        t.join()

    print("\nRace test results:")
    for i, result in enumerate(results, start=1):
        status, body = result
        print(f"Request {i}: status={status}, body={body}")

    print("\nIf one request succeeded and the other failed with 409, the booking race is handled by the backend.")
    print("If both succeed, the database constraint or transaction handling is not working as expected.")


if __name__ == "__main__":
    main()
