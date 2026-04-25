export const getNearbyPlaces = async (lat: number, lng: number) => {
  try {
    const query = `
      [out:json];
      (
        node["amenity"="hospital"](around:2000,${lat},${lng});
        node["amenity"="police"](around:2000,${lat},${lng});
        node["amenity"="fuel"](around:2000,${lat},${lng});
      );
      out;
    `;

    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query
    });

    const data = await res.json();

    return data.elements || [];

  } catch (err) {
    console.log("OSM error:", err);
    return [];
  }
};