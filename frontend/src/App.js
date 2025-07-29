import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import Header from './components/Header';
import RepartoForm from './components/RepartoForm';
import RepartosTable from './components/RepartosTable';
import api from './services/api';

function App() {
  const [session, setSession] = useState(null);
  const [repartos, setRepartos] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        api.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
        fetchRepartos();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        api.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
        fetchRepartos();
      } else {
        delete api.defaults.headers.common['Authorization'];
        setRepartos([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRepartos = async () => {
    try {
      const { data } = await api.get('/repartos');
      setRepartos(data);
    } catch (error) {
      console.error("Error fetching repartos:", error);
    }
  };

  const handleExport = async () => {
    if (!session) {
        alert("Debes iniciar sesión para exportar.");
        return;
    }
    try {
        const token = session.access_token;
        const response = await fetch(`${api.defaults.baseURL}/repartos/export`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || 'Falló la respuesta de la red al exportar.');
        }

        const disposition = response.headers.get('content-disposition');
        let filename = 'repartos.xlsx';
        if (disposition && disposition.indexOf('attachment') !== -1) {
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) {
                filename = matches[1].replace(/['"]/g, '');
            }
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error("Error al exportar a Excel:", error);
        alert(`No se pudo exportar el archivo: ${error.message}`);
    }
  };

  return (
    <div className="container">
      <div className="content">
        {!session ? (
          <Auth />
        ) : (
          <div>
            <Header session={session} />
            <RepartoForm session={session} onNewReparto={fetchRepartos} />
            
            {/* --- CORRECCIÓN: Contenedor de botones unificado --- */}
            <div className="export-container" style={{ margin: '20px 0' }}>
                <button onClick={handleExport} className="button block primary" style={{backgroundColor: '#28a745', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>
                    Exportar a Excel
                </button>
            </div>
            
            <RepartosTable repartos={repartos} setRepartos={setRepartos} session={session} fetchRepartos={fetchRepartos} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
