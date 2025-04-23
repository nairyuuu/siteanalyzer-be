import axios from 'axios';
import { getToken } from '../utils/auth';

export default function Download() {
  const downloadFile = async () => {
    const res = await axios.get('http://localhost:4000/api/download', {
      headers: { Authorization: `Bearer ${getToken()}` },
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'extension.zip');
    document.body.appendChild(link);
    link.click();
  };

  return (
    <>
      <h2>Download Extension</h2>
      <button onClick={downloadFile}>Download Now</button>
    </>
  );
}
