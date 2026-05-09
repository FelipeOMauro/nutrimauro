import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Users, Calendar, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Patient {
  id: string;
  nome: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [totalPatients, setTotalPatients] = useState<number>(0);
  const [weeklyConsultations, setWeeklyConsultations] = useState<number>(0);
  const [patientsWithoutReturn, setPatientsWithoutReturn] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Total de pacientes ativos
      const { count: patientsCount, error: pError } = await supabase
        .from('pacientes')
        .select('*', { count: 'exact', head: true })
        .eq('nutricionista_id', user!.id);

      if (pError) throw pError;
      setTotalPatients(patientsCount || 0);

      // 2. Consultas da semana
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Domingo
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Sábado
      endOfWeek.setHours(23, 59, 59, 999);

      const { count: consultationsCount, error: cError } = await supabase
        .from('consultas')
        .select('id, paciente_id, pacientes!inner(nutricionista_id)', { count: 'exact', head: true })
        .eq('pacientes.nutricionista_id', user!.id)
        .gte('data_consulta', startOfWeek.toISOString().split('T')[0])
        .lte('data_consulta', endOfWeek.toISOString().split('T')[0]);

      if (cError) throw cError;
      setWeeklyConsultations(consultationsCount || 0);

      // 3. Pacientes sem retorno
      // Regra: última consulta há mais de 30 dias E sem próximo retorno agendado
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

      // Pegamos todos os pacientes
      const { data: patients, error: prError } = await supabase
        .from('pacientes')
        .select(`
          id, 
          nome,
          consultas (
            data_consulta,
            proximo_retorno
          )
        `)
        .eq('nutricionista_id', user!.id);

      if (prError) throw prError;

      const withoutReturn = patients.filter(p => {
        const consultations = p.consultas as any[];
        if (!consultations || consultations.length === 0) return false;

        // Ordenar consultas por data descendente
        const sorted = [...consultations].sort((a, b) => 
          new Date(b.data_consulta).getTime() - new Date(a.data_consulta).getTime()
        );

        const lastConsultation = sorted[0];
        const hasNextReturn = sorted.some(c => c.proximo_retorno && new Date(c.proximo_retorno) >= new Date());

        return new Date(lastConsultation.data_consulta) < thirtyDaysAgo && !hasNextReturn;
      });

      setPatientsWithoutReturn(withoutReturn.map(p => ({ id: p.id, nome: p.nome })));

    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Loader2 className="loading-spinner" style={{ borderTopColor: 'var(--primary)', width: '40px', height: '40px' }} />
      </div>
    );
  }

  return (
    <div>
      <header>
        <h2 style={{ fontSize: '1.8rem' }}>Dashboard</h2>
        <p style={{ color: 'var(--text-muted)' }}>Bem-vinda de volta, Nutri!</p>
      </header>

      <div className="dashboard-grid">
        {/* Card 1: Total de Pacientes */}
        <div className="stat-card">
          <div className="stat-card-header">
            <h3>Total de Pacientes</h3>
            <div className="stat-icon">
              <Users size={20} />
            </div>
          </div>
          <div className="stat-value">{totalPatients}</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Pacientes ativos no sistema
          </p>
        </div>

        {/* Card 2: Consultas da Semana */}
        <div className="stat-card">
          <div className="stat-card-header">
            <h3>Consultas da Semana</h3>
            <div className="stat-icon">
              <Calendar size={20} />
            </div>
          </div>
          <div className="stat-value">{weeklyConsultations}</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Agendadas para esta semana
          </p>
        </div>

        {/* Card 3: Pacientes sem Retorno */}
        <div className="stat-card">
          <div className="stat-card-header">
            <h3>Pacientes sem Retorno</h3>
            <div className="stat-icon" style={{ background: '#fff1f2', color: '#e11d48' }}>
              <Clock size={20} />
            </div>
          </div>
          
          {patientsWithoutReturn.length > 0 ? (
            <ul className="patient-list">
              {patientsWithoutReturn.map(patient => (
                <li key={patient.id} className="patient-item">
                  <Link to={`/pacientes/${patient.id}`} className="patient-link">
                    {patient.nome}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <AlertCircle size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              Nenhum paciente sem retorno no momento
            </div>
          )}
          
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 'auto', paddingTop: '16px' }}>
            Última consulta há mais de 30 dias
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
