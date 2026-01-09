import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Configurar axios para que sepa a dónde apuntar (opcional, pero buena práctica)
axios.defaults.baseURL = 'http://localhost:5000'; 

export function useDashboardData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/data');
      setData(response.data);
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }, []);

  // --- AQUÍ ESTABA EL ERROR ---
  // Faltaba agregar 'campaignName' dentro de los paréntesis (files, campaignName)
  const uploadFiles = async (files, campaignName = "General") => {
    if (!files || files.length === 0) return;
    
    setLoading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) formData.append('files[]', files[i]);
    formData.append('username', '@compipro');
    
    // Ahora sí existe la variable campaignName para usarla aquí:
    formData.append('campaign', campaignName); 

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setData(response.data);
      alert(`✅ Archivos guardados en carpeta: ${campaignName}`);
    } catch (err) {
      console.error(err);
      alert("❌ Error al subir archivos. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, uploadFiles, refresh: fetchData };
}