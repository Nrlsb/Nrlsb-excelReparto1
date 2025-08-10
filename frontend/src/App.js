// frontend/src/App.js
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import api from './services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';

import Auth from './components/Auth';
import Header from './components/Header';
import Account from './components/Account';
import RepartoForm from './components/RepartoForm';
import RepartosTable from './components/RepartosTable';
import ConfirmModal from './components/ConfirmModal';
import Ruta from './components/Ruta';

function App() {
  const [session, setSession] = useState(null);
  const [repartos, setRepartos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('user');
  const [showAccountModal, setShowAccountModal] = useState(false);
  
  const [activeTab, setActiveTab] = useState('carga');
  const [optimizedData, setOptimizedData] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    const setupSession = async (session) => {
      setSession(session);
      if (session) {
        api.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
        
        try {
          const { data: profile, error } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
          if (error && error.code !== 'PGRST116') throw error;
          if (profile) setUserRole(profile.role);
          else setTimeout(() => setupSession(session), 1500);
        } catch (e) {
            console.error("Error al obtener el perfil:", e);
            setUserRole('user');
        }
        
        fetchRepartos();
      } else {
        delete api.defaults.headers.common['Authorization'];
        setRepartos([]);
        setUserRole('user');
        setLoading(false);
        setOptimizedData(null);
        setActiveTab('carga');
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => setupSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setupSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    const channel = supabase
      .channel('repartos_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'repartos' }, () => {
        fetchRepartos();
        setOptimizedData(null);
        setActiveTab('carga');
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [session]);

  const fetchRepartos = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/repartos');
      if (Array.isArray(data)) setRepartos(data);
      else {
        setRepartos([]);
        console.error("La API no devolvió un array para los repartos:", data);
      }
    } catch (error) {
      toast.error("Error al cargar los repartos.");
      setRepartos([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddReparto = async (newReparto) => {
    try {
      await api.post('/repartos', { ...newReparto, user_id: session.user.id });
      toast.success('Reparto agregado.');
    } catch (error) {
      toast.error('No se pudo agregar el reparto.');
    }
  };

  const handleUpdateReparto = async (id, updatedData) => {
    if (id === 'start_location') return;
    try {
      await api.put(`/repartos/${id}`, updatedData);
      toast.success(`Reparto #${id} actualizado.`);
    } catch (error) {
      toast.error('No se pudo actualizar el reparto.');
    }
  };

  const handleDeleteReparto = (id) => {
    if (id === 'start_location') return;
    setConfirmState({
      isOpen: true,
      title: 'Confirmar Eliminación',
      message: `¿Estás seguro de que quieres eliminar el reparto #${id}?`,
      onConfirm: async () => {
        try {
          await api.delete(`/repartos/${id}`);
          toast.info(`Reparto #${id} eliminado.`);
        } catch (error) {
          toast.error('No se pudo eliminar el reparto.');
        }
        closeConfirmModal();
      },
    });
  };
  
  const hasElevatedPermissions = userRole === 'admin' || userRole === 'especial';

  const handleClearRepartos = () => {
    const message = hasElevatedPermissions ? '¿Estás seguro de que quieres eliminar TODOS los repartos?' : '¿Estás seguro de que quieres eliminar TODOS TUS repartos?';
    setConfirmState({
      isOpen: true,
      title: 'Confirmar Vaciado',
      message: message,
      onConfirm: async () => {
        try {
          await api.delete('/repartos/all');
          toast.warn('Se han eliminado los repartos.');
        } catch (error) {
          toast.error('No se pudieron eliminar los repartos.');
        }
        closeConfirmModal();
      },
    });
  };
  
  const handleOptimizeRoute = async () => {
    if (repartos.length < 1) {
      toast.info('Necesitas al menos 1 reparto para optimizar la ruta.');
      return;
    }
    setIsOptimizing(true);
    try {
      toast.info('Obteniendo tu ubicación actual...');
      const position = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
      const currentLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
      
      toast.info('Optimizando la ruta...');
      const { data } = await api.post('/repartos/optimize', { repartos, currentLocation });
      
      setOptimizedData({ repartos: data.optimizedRepartos, polyline: data.polyline });
      setActiveTab('ruta');
      toast.success('Ruta optimizada con éxito.');
    } catch (error) {
      const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message || 'No se pudo optimizar la ruta.';
      toast.error(errorMessage, { autoClose: 5000 });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSimpleExportExcel = () => {
    if (repartos.length === 0) return toast.info('No hay repartos para exportar.');
    const dataToExport = repartos.map(r => ({
      'ID': r.id, 'Destino': r.destino, 'Dirección': r.direccion,
      'Horarios': r.horarios, 'Bultos': r.bultos,
      // --- CORRECCIÓN: Usar hasElevatedPermissions en lugar de isAdmin ---
      ...(hasElevatedPermissions && {'Agregado por': r.agregado_por})
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Repartos");
    XLSX.writeFile(wb, "repartos.xlsx");
  };

  const handleTemplateExport = async () => {
    try {
      const response = await api.get('/repartos/export', { responseType: 'blob' });
      const disposition = response.headers['content-disposition'];
      let filename = 'repartos.xlsx';
      if (disposition && disposition.includes('attachment')) {
        const filenameMatch = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
        if (filenameMatch && filenameMatch[1]) filename = filenameMatch[1].replace(/['"]/g, '');
      }
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(`No se pudo exportar el archivo: ${error.message}`);
    }
  };
  
  const handleUpdateProfile = async (username) => {
    try {
      await api.put('/profile', { username });
      await supabase.auth.refreshSession();
      toast.success('Perfil actualizado.');
      setShowAccountModal(false);
    } catch (error) {
      toast.error('No se pudo actualizar el perfil.');
      console.error('Error updating profile:', error);
    }
  };


  const closeConfirmModal = () => setConfirmState({ isOpen: false });

  const TabButton = ({ tabName, label }) => {
    const isActive = activeTab === tabName;
    const isDisabled = tabName === 'ruta' && !optimizedData;
    return (
      <button
        onClick={() => !isDisabled && setActiveTab(tabName)}
        disabled={isDisabled}
        className={`py-2 px-6 text-sm font-semibold rounded-t-lg transition-colors focus:outline-none ${
          isActive ? 'bg-white text-purple-600' : 'bg-transparent text-gray-500 hover:bg-gray-200'
        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {label}
      </button>
    );
  };

  return (
    <>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {!session ? <Auth /> : (
          <div>
            <Header session={session} onOpenAccountModal={() => setShowAccountModal(true)} />
            <div className="flex border-b border-gray-300">
              <TabButton tabName="carga" label="Carga de Repartos" />
              <TabButton tabName="ruta" label="Visualización de Ruta" />
            </div>
            <div className="pt-6">
              {activeTab === 'carga' && (
                <>
                  <RepartoForm onAddReparto={handleAddReparto} session={session} />
                  <div className="flex flex-wrap gap-4 mb-5">
                    <button onClick={handleOptimizeRoute} disabled={isOptimizing || loading} className="px-5 py-2 border-none rounded-lg text-sm font-semibold cursor-pointer transition-transform duration-200 uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:scale-105 disabled:opacity-60">
                      {isOptimizing ? 'Optimizando...' : '🗺️ Optimizar Ruta'}
                    </button>
                    <button onClick={handleSimpleExportExcel} className="px-5 py-2 border-none rounded-lg text-sm font-semibold cursor-pointer transition-transform duration-200 uppercase tracking-wider text-white bg-gradient-to-r from-green-500 to-teal-500 hover:scale-105">
                      📊 Exportar a Excel
                    </button>
                    <button onClick={handleTemplateExport} className="px-5 py-2 border-none rounded-lg text-sm font-semibold cursor-pointer transition-transform duration-200 uppercase tracking-wider text-white bg-gradient-to-r from-blue-500 to-sky-500 hover:scale-105">
                      📋 Exportar con Plantilla
                    </button>
                    <button onClick={handleClearRepartos} className="px-5 py-2 border-none rounded-lg text-sm font-semibold cursor-pointer transition-transform duration-200 uppercase tracking-wider text-white bg-gradient-to-r from-red-500 to-orange-500 hover:scale-105">
                      🗑️ Vaciar Todo
                    </button>
                  </div>
                  <RepartosTable repartos={repartos} loading={loading} onUpdateReparto={handleUpdateReparto} onDeleteReparto={handleDeleteReparto} isAdmin={hasElevatedPermissions} />
                </>
              )}
              {activeTab === 'ruta' && optimizedData && (
                <Ruta repartos={optimizedData.repartos} polyline={optimizedData.polyline} onUpdateReparto={handleUpdateReparto} onDeleteReparto={handleDeleteReparto} isAdmin={hasElevatedPermissions} />
              )}
            </div>
          </div>
        )}
      </div>
      {showAccountModal && <Account session={session} onClose={() => setShowAccountModal(false)} onSave={handleUpdateProfile} />}
      <ConfirmModal isOpen={confirmState.isOpen} onClose={closeConfirmModal} onConfirm={confirmState.onConfirm} title={confirmState.title}>
        {confirmState.message}
      </ConfirmModal>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} />
    </>
  );
}

export default App;
