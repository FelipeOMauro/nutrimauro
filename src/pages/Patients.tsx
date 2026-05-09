import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Search, UserPlus, Eye, Edit2, Trash2, Loader2, SearchX, Target } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface Patient {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  objetivos: string[] | null;
  consultas: { data_consulta: string }[];
}

const Patients: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchPatients();
    }
  }, [user]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select(`
          id,
          nome,
          email,
          telefone,
          objetivos,
          consultas (data_consulta)
        `)
        .eq('nutricionista_id', user!.id)
        .order('nome');

      if (error) throw error;
      setPatients(data || []);
    } catch (err) {
      console.error('Erro ao buscar pacientes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (confirm(`Tem certeza que deseja excluir o paciente ${nome}? Todos os dados de consultas e planos também serão apagados.`)) {
      try {
        const { error } = await supabase
          .from('pacientes')
          .delete()
          .eq('id', id);

        if (error) throw error;
        setPatients(patients.filter(p => p.id !== id));
      } catch (err) {
        alert('Erro ao excluir paciente.');
      }
    }
  };

  const filteredPatients = patients.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getLastConsultation = (consultas: { data_consulta: string }[]) => {
    if (!consultas || consultas.length === 0) return 'Nenhuma';
    const dates = consultas.map(c => new Date(c.data_consulta).getTime());
    const latest = new Date(Math.max(...dates));
    return latest.toLocaleDateString('pt-BR');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: '1.8rem' }}>Pacientes</h2>
          <p style={{ color: 'var(--text-muted)' }}>Gerencie seus clientes e acompanhamentos.</p>
        </div>
        
        <button className="btn btn-primary" onClick={() => navigate('/pacientes/novo')} style={{ width: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <UserPlus size={20} />
          Novo Paciente
        </button>
      </div>

      <div className="search-bar">
        <Search size={18} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Buscar por nome..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Loader2 className="loading-spinner" style={{ borderTopColor: 'var(--primary)' }} />
          </div>
        ) : filteredPatients.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Objetivo</th>
                <th>Última Consulta</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map(patient => (
                <tr key={patient.id} onClick={() => navigate(`/pacientes/${patient.id}`)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div style={{ fontWeight: '600' }}>{patient.nome}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{patient.email || patient.telefone || 'Sem contato'}</div>
                  </td>
                  <td>
                    {patient.objetivos && patient.objetivos.length > 0 ? (
                      <span className="badge badge-primary">{patient.objetivos[0]}</span>
                    ) : (
                      <span className="badge">-</span>
                    )}
                  </td>
                  <td>{getLastConsultation(patient.consultas)}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                      <button className="action-btn" title="Ver Perfil" onClick={() => navigate(`/pacientes/${patient.id}`)}>
                        <Eye size={16} />
                      </button>
                      <button className="action-btn" title="Editar">
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="action-btn delete" 
                        title="Excluir"
                        onClick={() => handleDelete(patient.id, patient.nome)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <SearchX size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>{searchTerm ? 'Nenhum paciente encontrado para esta busca.' : 'Nenhum paciente cadastrado ainda.'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Patients;
