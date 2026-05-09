import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, User as UserIcon } from 'lucide-react';

const PatientProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div>
      <header className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="action-btn" onClick={() => navigate('/pacientes')}>
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.8rem' }}>Perfil do Paciente</h2>
            <p style={{ color: 'var(--text-muted)' }}>ID: {id}</p>
          </div>
        </div>
      </header>

      <div className="auth-card" style={{ maxWidth: 'none', textAlign: 'center', padding: '60px' }}>
        <UserIcon size={64} color="var(--primary)" style={{ marginBottom: '24px' }} />
        <h3>Em breve: Prontuário Completo</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '12px' }}>
          Aqui você poderá visualizar todas as informações clínicas, hábitos e histórico de consultas do paciente.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/pacientes')} style={{ width: 'auto', marginTop: '32px' }}>
          Voltar para Lista
        </button>
      </div>
    </div>
  );
};

export default PatientProfile;
