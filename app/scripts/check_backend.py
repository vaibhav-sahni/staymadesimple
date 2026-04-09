import requests

urls = [
    "http://localhost:8000/properties",
    "http://localhost:8000/properties/1/rooms",
    "http://localhost:8000/properties/1/bookings",
]
for u in urls:
    try:
        r = requests.get(u, timeout=10)
        print(u, '->', r.status_code, r.text[:200])
    except Exception as e:
        print(u, '-> ERROR', repr(e))
