import axios from 'axios';

export default async function handler(req, res) {
  try {
    const response = await axios.get('http://localhost:4000/api/version');
    res.status(200).send(response.data.version); // Send the version as plain text
  } catch (error) {
    console.error('Error fetching version:', error.message);
    res.status(500).send('Failed to fetch version'); // Send error as plain text
  }
}