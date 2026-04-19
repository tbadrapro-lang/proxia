export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { place_id } = req.query;
  if (!place_id) {
    return res.status(400).json({ error: 'place_id required' });
  }
  const API_KEY = 'AIzaSyDDLSmONWL4a-SJr3TQIJU51joWgnIlpl0';
  const fields = 'name,formatted_phone_number,international_phone_number,website,formatted_address,rating,user_ratings_total,url';
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=${fields}&language=fr&key=${API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
