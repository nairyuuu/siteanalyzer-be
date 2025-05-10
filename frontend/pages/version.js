import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Version() {
  const [version, setVersion] = useState('');

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/version`);
        setVersion(response.data.version);
      } catch (error) {
        console.error('Error fetching version:', error.message);
        setVersion('Error fetching version');
      }
    };

    fetchVersion();
  }, []);

  return <>{version}</>;
}