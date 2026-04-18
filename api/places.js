export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { lat, lng, keyword } = req.query;
  const API_KEY = 'AIzaSyDDLSmONWL4a-SJr3TQIJU51joWgnIlpl0';
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=3000&keyword=${encodeURIComponent(keyword)}&language=fr&key=${API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  res.status(200).json(data);
}
