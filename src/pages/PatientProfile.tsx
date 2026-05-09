import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  ChevronLeft, User as UserIcon, Calendar, TrendingUp, Apple, 
  Plus, Edit2, Save, Loader2, CheckCircle2, History, Info
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ConsultationModal from '../components/ConsultationModal';

interface Patient {
  id: string;
  nome: string;
  data_nascimento: string | null;
  sexo: string | null;
  telefone: string | null;
  whatsapp: string | null;
  email: string | null;
  peso_inicial: number | null;
  altura: number | null;
  objetivos: string[] | null;
  objetivo_texto: string | null;
  nivel_atividade: string | null;
  patologias: string[] | null;
  restricoes_alimentares: string[] | null;
  alergias: string[] | null;
  medicamentos: string | null;
  suplementos: string | null;
  refeicoes_por_dia: number | null;
  horario_acorda: string | null;
  horario_dorme: string | null;
  litros_agua: number | null;
  atividade_fisica: boolean;
  atividade_fisica_descricao: string | null;
  observacoes: string | null;
}

interface Consultation {
  id: string;
  data_consulta: string;
  peso: number;
  cintura: number | null;
  quadril: number | null;
  percentual_gordura: number | null;
  observacoes: string | null;
  proximo_retorno: string | null;
}

interface MealPlan {
  id: string;
  conteudo: any;
  created_at: string;
}

const PatientProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('pessoal');
  const [activeSection, setActiveSection] = useState('dados'); // 'dados', 'consultas', 'planos'
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPatientData();
    }
  }, [id]);

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      // Fetch Patient
      const { data: pData, error: pError } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (pError) throw pError;
      setPatient(pData);

      // Fetch Consultations
      const { data: cData, error: cError } = await supabase
        .from('consultas')
        .select('*')
        .eq('paciente_id', id)
        .order('data_consulta', { ascending: true });
      
      if (cError) throw cError;
      setConsultations(cData || []);

      // Fetch Meal Plans
      const { data: mData, error: mError } = await supabase
        .from('planos_alimentares')
        .select('*')
        .eq('paciente_id', id)
        .order('created_at', { ascending: false });
      
      if (mError) throw mError;
      setMealPlans(mData || []);

    } catch (err) {
      console.error('Erro ao carregar dados do paciente:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('pacientes')
        .update(patient)
        .eq('id', id);
      
      if (error) throw error;
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao atualizar paciente:', err);
      alert('Erro ao salvar alterações.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setPatient(prev => prev ? ({ ...prev, [id]: val }) : null);
  };

  const handleMultiSelect = (field: keyof Patient, value: string) => {
    if (!patient) return;
    const current = (patient[field] as string[]) || [];
    let updated;
    if (current.includes(value)) {
      updated = current.filter(item => item !== value);
    } else {
      updated = [...current, value];
    }
    setPatient({ ...patient, [field]: updated });
  };

  // Chart data preparation
  const chartData = consultations.map(c => ({
    data: new Date(c.data_consulta).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    peso: c.peso
  }));

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader2 className="loading-spinner" size={40} />
      </div>
    );
  }

  if (!patient) return <div>Paciente não encontrado.</div>;

  return (
    <div style={{ maxWidth: '1200px' }}>
      <header className="page-header" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="action-btn" onClick={() => navigate('/pacientes')}>
            <ChevronLeft size={24} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="avatar" style={{ width: '64px', height: '64px', background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-dark)' }}>
              <UserIcon size={32} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.8rem' }}>{patient.nome}</h2>
              <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                {patient.objetivos?.map(obj => (
                  <span key={obj} className="badge badge-primary">{obj}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Navigation */}
      <div className="tabs" style={{ marginBottom: '32px' }}>
        <button 
          className={`tab-item ${activeSection === 'dados' ? 'active' : ''}`}
          onClick={() => setActiveSection('dados')}
        >
          <Info size={18} style={{ marginRight: '8px' }} /> Dados do Paciente
        </button>
        <button 
          className={`tab-item ${activeSection === 'consultas' ? 'active' : ''}`}
          onClick={() => setActiveSection('consultas')}
        >
          <Calendar size={18} style={{ marginRight: '8px' }} /> Consultas
        </button>
        <button 
          className={`tab-item ${activeSection === 'planos' ? 'active' : ''}`}
          onClick={() => setActiveSection('planos')}
        >
          <Apple size={18} style={{ marginRight: '8px' }} /> Planos Alimentares
        </button>
      </div>

      {/* SECTION 1: DADOS DO PACIENTE */}
      {activeSection === 'dados' && (
        <div className="fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['pessoal', 'clinico', 'habitos'].map(t => (
                <button 
                  key={t}
                  className={`btn ${activeTab === t ? 'btn-primary' : ''}`}
                  style={{ width: 'auto', background: activeTab === t ? 'var(--primary)' : 'white', color: activeTab === t ? 'white' : 'var(--text-main)', border: '1px solid var(--border)' }}
                  onClick={() => setActiveTab(t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <button className="btn btn-primary" onClick={handlePatientUpdate} disabled={saving} style={{ width: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
              {saving ? <Loader2 className="loading-spinner" /> : <><Save size={20} /> Salvar Alterações</>}
            </button>
          </div>

          {saveSuccess && (
            <div style={{ background: '#f0fdf4', color: '#166534', padding: '12px 20px', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={20} /> Alterações salvas com sucesso!
            </div>
          )}

          <form>
            {activeTab === 'pessoal' && (
              <div className="form-section">
                <h3>Informações Básicas</h3>
                <div className="form-grid">
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Nome Completo</label>
                    <input type="text" id="nome" value={patient.nome || ''} onChange={handleInputChange} className="input-wrapper" />
                  </div>
                  <div className="form-group">
                    <label>Data de Nascimento</label>
                    <input type="date" id="data_nascimento" value={patient.data_nascimento || ''} onChange={handleInputChange} className="input-wrapper" />
                  </div>
                  <div className="form-group">
                    <label>Sexo</label>
                    <select id="sexo" value={patient.sexo || ''} onChange={handleInputChange} className="input-wrapper" style={{ width: '100%', padding: '12px' }}>
                      <option value="Feminino">Feminino</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                </div>
                <div className="form-grid" style={{ marginTop: '20px' }}>
                  <div className="form-group">
                    <label>Telefone</label>
                    <input type="tel" id="telefone" value={patient.telefone || ''} onChange={handleInputChange} className="input-wrapper" />
                  </div>
                  <div className="form-group">
                    <label>WhatsApp</label>
                    <input type="tel" id="whatsapp" value={patient.whatsapp || ''} onChange={handleInputChange} className="input-wrapper" />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" id="email" value={patient.email || ''} onChange={handleInputChange} className="input-wrapper" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'clinico' && (
              <div className="form-section">
                <h3>Antropometria e Objetivos</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Peso Inicial (kg)</label>
                    <input type="number" step="0.1" id="peso_inicial" value={patient.peso_inicial || ''} onChange={handleInputChange} className="input-wrapper" />
                  </div>
                  <div className="form-group">
                    <label>Altura (cm)</label>
                    <input type="number" id="altura" value={patient.altura || ''} onChange={handleInputChange} className="input-wrapper" />
                  </div>
                  <div className="form-group">
                    <label>Nível de Atividade</label>
                    <select id="nivel_atividade" value={patient.nivel_atividade || ''} onChange={handleInputChange} className="input-wrapper" style={{ width: '100%', padding: '12px' }}>
                      <option value="Sedentário">Sedentário</option>
                      <option value="Levemente ativo">Levemente ativo</option>
                      <option value="Moderadamente ativo">Moderadamente ativo</option>
                      <option value="Muito ativo">Muito ativo</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: '24px' }}>
                  <label>Objetivos</label>
                  <div className="choices-grid">
                    {['Emagrecer', 'Ganhar massa', 'Controlar diabetes', 'Saúde geral'].map(obj => (
                      <label key={obj} className={`choice-item ${patient.objetivos?.includes(obj) ? 'selected' : ''}`}>
                        <input type="checkbox" checked={patient.objetivos?.includes(obj)} onChange={() => handleMultiSelect('objetivos', obj)} />
                        {obj}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'habitos' && (
              <div className="form-section">
                <h3>Rotina e Hábitos</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Refeições/dia</label>
                    <input type="number" id="refeicoes_por_dia" value={patient.refeicoes_por_dia || ''} onChange={handleInputChange} className="input-wrapper" />
                  </div>
                  <div className="form-group">
                    <label>Água (litros)</label>
                    <input type="number" step="0.1" id="litros_agua" value={patient.litros_agua || ''} onChange={handleInputChange} className="input-wrapper" />
                  </div>
                  <div className="form-group">
                    <label>Acorda</label>
                    <input type="text" id="horario_acorda" value={patient.horario_acorda || ''} onChange={handleInputChange} className="input-wrapper" />
                  </div>
                  <div className="form-group">
                    <label>Dorme</label>
                    <input type="text" id="horario_dorme" value={patient.horario_dorme || ''} onChange={handleInputChange} className="input-wrapper" />
                  </div>
                </div>
                <div style={{ marginTop: '24px' }}>
                  <label htmlFor="observacoes">Observações Gerais</label>
                  <textarea id="observacoes" value={patient.observacoes || ''} onChange={handleInputChange} rows={4} className="input-wrapper" style={{ width: '100%', padding: '12px' }} />
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {/* SECTION 2: CONSULTAS */}
      {activeSection === 'consultas' && (
        <div className="fade-in">
          <div className="form-section" style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Evolução de Peso</h3>
              <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ width: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Plus size={20} /> Nova Consulta
              </button>
            </div>
            
            {consultations.length > 0 ? (
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="data" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis domain={['auto', 'auto']} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="peso" 
                      stroke="var(--primary)" 
                      strokeWidth={3} 
                      dot={{ r: 6, fill: 'var(--primary)', strokeWidth: 2, stroke: '#white' }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', border: '2px dashed var(--border)', borderRadius: '12px' }}>
                Nenhuma consulta registrada ainda.
              </div>
            )}
          </div>

          <div className="form-section">
            <h3>Histórico de Consultas</h3>
            <div className="table-container">
              {consultations.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Peso (kg)</th>
                      <th>Cintura (cm)</th>
                      <th>Quadril (cm)</th>
                      <th>% Gordura</th>
                      <th>Próximo Retorno</th>
                      <th style={{ textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...consultations].reverse().map(c => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: '600' }}>{new Date(c.data_consulta).toLocaleDateString('pt-BR')}</td>
                        <td>{c.peso}</td>
                        <td>{c.cintura || '-'}</td>
                        <td>{c.quadril || '-'}</td>
                        <td>{c.percentual_gordura ? `${c.percentual_gordura}%` : '-'}</td>
                        <td>{c.proximo_retorno ? new Date(c.proximo_retorno).toLocaleDateString('pt-BR') : '-'}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="action-btn"><Edit2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Nenhum registro encontrado.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: PLANOS ALIMENTARES */}
      {activeSection === 'planos' && (
        <div className="fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h3>Planos Alimentares</h3>
              <p style={{ color: 'var(--text-muted)' }}>Histórico de dietas e orientações.</p>
            </div>
            <button className="btn btn-primary" style={{ width: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Apple size={20} /> Gerar Plano Alimentar
            </button>
          </div>

          <div className="form-section">
            {mealPlans.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Data de Geração</th>
                      <th>Título / Refeições</th>
                      <th style={{ textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mealPlans.map(plan => (
                      <tr key={plan.id}>
                        <td style={{ fontWeight: '600' }}>{new Date(plan.created_at).toLocaleDateString('pt-BR')}</td>
                        <td>{plan.conteudo?.titulo || 'Plano Alimentar Personalizado'}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="action-btn"><History size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Apple size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                <p>Nenhum plano alimentar gerado ainda.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <ConsultationModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onSuccess={fetchPatientData}
        pacienteId={id!}
      />
    </div>
  );
};

export default PatientProfile;
