# Geocoding proxy: calls Nominatim from the server to avoid CORS and 403.
# No auth required so anyone can search locations.

import json
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from fastapi import APIRouter, Query

router = APIRouter(prefix="/geocode", tags=["geocode"])


@router.get("")
def geocode(q: str = Query(..., min_length=1), limit: int = Query(1, ge=1, le=5)):
    url = "https://nominatim.openstreetmap.org/search?" + urlencode(
        {"format": "json", "q": q, "limit": limit}
    )
    req = Request(url, headers={"User-Agent": "WC-Advisor/1.0"})
    with urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode())
    return [{"lat": float(r["lat"]), "lon": float(r["lon"])} for r in data]
