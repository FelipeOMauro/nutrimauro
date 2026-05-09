import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Save, ChevronRight, ChevronLeft, Loader2, CheckCircle2 } from 'lucide-react';

const NewPatient: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pessoal');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Pessoal
    nome: '',
    data_nascimento: '',
    sexo: '',
    telefone: '',
    whatsapp: '',
    email: '',
    // Clínico
    peso_inicial: '',
    altura: '',
    objetivos: [] as string[],
    objetivo_texto: '',
    nivel_atividade: '',
    patologias: [] as string[],
    restricoes_alimentares: [] as string[],
    alergias: [] as string[],
    medicamentos: '',
    suplementos: '',
    // Hábitos
    refeicoes_por_dia: '',
    horario_acorda: '',
    horario_dorme: '',
    litros_agua: '',
    atividade_fisica: false,
    atividade_fisica_descricao: '',
    observacoes: ''
  });

  // Derived Values
  const [idade, setIdade] = useState<number | null>(null);
  const [imc, setImc] = useState<string | null>(null);

  useEffect(() => {
    if (formData.data_nascimento) {
      const birthDate = new Date(formData.data_nascimento);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setIdade(age);
    }
  }, [formData.data_nascimento]);

  useEffect(() => {
    if (formData.peso_inicial && formData.altura) {
      const peso = parseFloat(formData.peso_inicial);
      const altura = parseFloat(formData.altura) / 100; // cm para m
      if (peso > 0 && altura > 0) {
        const calculatedImc = (peso / (altura * altura)).toFixed(1);
        setImc(calculatedImc);
      }
    }
  }, [formData.peso_inicial, formData.altura]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({ ...prev, [id]: val }));
  };

  const handleMultiSelect = (field: string, value: string) => {
    setFormData(prev => {
      const current = prev[field as keyof typeof prev] as string[];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const formatTimeInput = (id: string, value: string) => {
    // Remove non-numbers
    let clean = value.replace(/\D/g, '');
    if (clean.length > 4) clean = clean.slice(0, 4);
    
    let formatted = clean;
    if (clean.length >= 3) {
      formatted = clean.slice(0, clean.length - 2) + ':' + clean.slice(clean.length - 2);
    }
    
    setFormData(prev => ({ ...prev, [id]: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab !== 'habitos') return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('pacientes')
        .insert([{
          ...formData,
          nutricionista_id: user!.id,
          data_nascimento: formData.data_nascimento || null,
          peso_inicial: formData.peso_inicial ? parseFloat(formData.peso_inicial) : null,
          altura: formData.altura ? parseFloat(formData.altura) : null,
          refeicoes_por_dia: formData.refeicoes_por_dia ? parseInt(formData.refeicoes_por_dia) : null,
          litros_agua: formData.litros_agua ? parseFloat(formData.litros_agua) : null,
        }])
        .select()
        .single();

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        navigate(`/pacientes/${data.id}`);
      }, 1500);
    } catch (err) {
      console.error('Erro ao salvar paciente:', err);
      alert('Erro ao salvar os dados do paciente.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'pessoal', label: 'Pessoal' },
    { id: 'clinico', label: 'Clínico' },
    { id: 'habitos', label: 'Hábitos' },
  ];

  if (success) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <CheckCircle2 size={64} color="var(--primary)" style={{ marginBottom: '24px' }} />
        <h2>Paciente cadastrado com sucesso!</h2>
        <p style={{ color: 'var(--text-muted)' }}>Redirecionando para o perfil...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px' }}>
      <header className="page-header">
        <div>
          <h2 style={{ fontSize: '1.8rem' }}>Novo Paciente</h2>
          <p style={{ color: 'var(--text-muted)' }}>Preencha as informações para iniciar o acompanhamento.</p>
        </div>
      </header>

      <div className="tabs">
        {tabs.map(tab => (
          <div 
            key={tab.id} 
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* ABA 1: PESSOAL */}
        {activeTab === 'pessoal' && (
          <div className="form-section">
            <h3>Informações Básicas</h3>
            <div className="form-grid">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label htmlFor="nome">Nome Completo *</label>
                <div className="input-wrapper">
                  <input type="text" id="nome" value={formData.nome} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="data_nascimento">Data de Nascimento</label>
                <div className="input-wrapper">
                  <input type="date" id="data_nascimento" value={formData.data_nascimento} onChange={handleInputChange} />
                </div>
                {idade !== null && <span style={{ fontSize: '0.8rem', color: 'var(--primary-dark)', fontWeight: '600' }}>Idade: {idade} anos</span>}
              </div>
              <div className="form-group">
                <label htmlFor="sexo">Sexo</label>
                <select id="sexo" value={formData.sexo} onChange={handleInputChange} className="input-wrapper" style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <option value="">Selecione...</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="telefone">Telefone</label>
                <div className="input-wrapper">
                  <input type="tel" id="telefone" value={formData.telefone} onChange={handleInputChange} placeholder="(00) 0000-0000" />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="whatsapp">WhatsApp</label>
                <div className="input-wrapper">
                  <input type="tel" id="whatsapp" value={formData.whatsapp} onChange={handleInputChange} placeholder="(00) 00000-0000" />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-wrapper">
                  <input type="email" id="email" value={formData.email} onChange={handleInputChange} placeholder="email@exemplo.com" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: CLÍNICO */}
        {activeTab === 'clinico' && (
          <div className="form-section">
            <h3>Antropometria e Saúde</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="peso_inicial">Peso Atual (kg)</label>
                <div className="input-wrapper">
                  <input type="number" step="0.1" id="peso_inicial" value={formData.peso_inicial} onChange={handleInputChange} placeholder="0.0" />
                  <span style={{ position: 'absolute', right: '16px', top: '12px', color: 'var(--text-muted)' }}>kg</span>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="altura">Altura (cm)</label>
                <div className="input-wrapper">
                  <input type="number" id="altura" value={formData.altura} onChange={handleInputChange} placeholder="0" />
                  <span style={{ position: 'absolute', right: '16px', top: '12px', color: 'var(--text-muted)' }}>cm</span>
                </div>
              </div>
              <div className="form-group">
                <label>IMC</label>
                <div className="info-field">{imc || '-'}</div>
              </div>
            </div>

            <div className="form-group">
              <label>Objetivo</label>
              <div className="choices-grid">
                {['Emagrecer', 'Ganhar massa', 'Controlar diabetes', 'Saúde geral', 'Performance esportiva', 'Reeducação alimentar'].map(obj => (
                  <label key={obj} className={`choice-item ${formData.objetivos.includes(obj) ? 'selected' : ''}`}>
                    <input type="checkbox" checked={formData.objetivos.includes(obj)} onChange={() => handleMultiSelect('objetivos', obj)} />
                    {obj}
                  </label>
                ))}
              </div>
              <div className="input-wrapper" style={{ marginTop: '12px' }}>
                <input type="text" id="objetivo_texto" value={formData.objetivo_texto} onChange={handleInputChange} placeholder="Outro objetivo ou detalhes..." />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '24px' }}>
              <label htmlFor="nivel_atividade">Nível de Atividade Física</label>
              <select id="nivel_atividade" value={formData.nivel_atividade} onChange={handleInputChange} className="input-wrapper" style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <option value="">Selecione...</option>
                <option value="Sedentário">Sedentário</option>
                <option value="Levemente ativo">Levemente ativo</option>
                <option value="Moderadamente ativo">Moderadamente ativo</option>
                <option value="Muito ativo">Muito ativo</option>
                <option value="Extremamente ativo">Extremamente ativo</option>
              </select>
            </div>

            <div className="form-group" style={{ marginTop: '24px' }}>
              <label>Patologias ou Condições</label>
              <div className="choices-grid">
                {['Diabetes', 'Hipertensão', 'Hipotireoidismo', 'Hipertireoidismo', 'Síndrome do ovário policístico', 'Doença celíaca', 'Colesterol alto'].map(pat => (
                  <label key={pat} className={`choice-item ${formData.patologias.includes(pat) ? 'selected' : ''}`}>
                    <input type="checkbox" checked={formData.patologias.includes(pat)} onChange={() => handleMultiSelect('patologias', pat)} />
                    {pat}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-grid" style={{ marginTop: '24px' }}>
              <div className="form-group">
                <label htmlFor="medicamentos">Medicamentos Contínuos</label>
                <textarea id="medicamentos" value={formData.medicamentos} onChange={handleInputChange} rows={3} className="input-wrapper" style={{ width: '100%', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} />
              </div>
              <div className="form-group">
                <label htmlFor="suplementos">Suplementos em Uso</label>
                <textarea id="suplementos" value={formData.suplementos} onChange={handleInputChange} rows={3} className="input-wrapper" style={{ width: '100%', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} />
              </div>
            </div>
          </div>
        )}

        {/* ABA 3: HÁBITOS */}
        {activeTab === 'habitos' && (
          <div className="form-section">
            <h3>Rotina e Hábitos</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="refeicoes_por_dia">Refeições por dia</label>
                <div className="input-wrapper">
                  <input type="number" id="refeicoes_por_dia" value={formData.refeicoes_por_dia} onChange={handleInputChange} />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="horario_acorda">Horário que acorda</label>
                <div className="input-wrapper">
                  <input 
                    type="text" 
                    id="horario_acorda" 
                    value={formData.horario_acorda} 
                    onChange={(e) => formatTimeInput('horario_acorda', e.target.value)} 
                    placeholder="ex: 06:00"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="horario_dorme">Horário que dorme</label>
                <div className="input-wrapper">
                  <input 
                    type="text" 
                    id="horario_dorme" 
                    value={formData.horario_dorme} 
                    onChange={(e) => formatTimeInput('horario_dorme', e.target.value)} 
                    placeholder="ex: 23:00"
                  />
                </div>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="litros_agua">Água por dia (litros)</label>
                <div className="input-wrapper">
                  <input type="number" step="0.1" id="litros_agua" value={formData.litros_agua} onChange={handleInputChange} />
                  <span style={{ position: 'absolute', right: '16px', top: '12px', color: 'var(--text-muted)' }}>litros</span>
                </div>
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" id="atividade_fisica" checked={formData.atividade_fisica} onChange={handleInputChange} style={{ width: '20px', height: '20px' }} />
                  Pratica atividade física?
                </label>
                {formData.atividade_fisica && (
                  <div className="input-wrapper" style={{ marginTop: '12px' }}>
                    <input type="text" id="atividade_fisica_descricao" value={formData.atividade_fisica_descricao} onChange={handleInputChange} placeholder="Qual atividade e frequência semanal?" />
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="observacoes">Observações Gerais</label>
              <textarea id="observacoes" value={formData.observacoes} onChange={handleInputChange} rows={4} className="input-wrapper" style={{ width: '100%', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
          <button 
            type="button" 
            className="btn" 
            style={{ width: 'auto', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            onClick={() => navigate('/pacientes')}
          >
            Cancelar
          </button>

          <div style={{ display: 'flex', gap: '12px' }}>
            {activeTab === 'pessoal' ? (
              <button 
                key="btn-next-pessoal"
                type="button" 
                className="btn btn-primary" 
                onClick={(e) => { e.preventDefault(); setActiveTab('clinico'); }} 
                style={{ width: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}
              >
                Próximo <ChevronRight size={20} />
              </button>
            ) : activeTab === 'clinico' ? (
              <>
                <button 
                  key="btn-prev-clinico"
                  type="button" 
                  className="btn" 
                  onClick={(e) => { e.preventDefault(); setActiveTab('pessoal'); }} 
                  style={{ width: 'auto', background: '#f1f5f9', border: 'none', display: 'flex', gap: '8px', alignItems: 'center' }}
                >
                  <ChevronLeft size={20} /> Anterior
                </button>
                <button 
                  key="btn-next-clinico"
                  type="button" 
                  className="btn btn-primary" 
                  onClick={(e) => { e.preventDefault(); setActiveTab('habitos'); }} 
                  style={{ width: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}
                >
                  Próximo <ChevronRight size={20} />
                </button>
              </>
            ) : (
              <>
                <button 
                  key="btn-prev-habitos"
                  type="button" 
                  className="btn" 
                  onClick={(e) => { e.preventDefault(); setActiveTab('clinico'); }} 
                  style={{ width: 'auto', background: '#f1f5f9', border: 'none', display: 'flex', gap: '8px', alignItems: 'center' }}
                >
                  <ChevronLeft size={20} /> Anterior
                </button>
                <button 
                  key="btn-submit"
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={loading} 
                  style={{ width: 'auto', display: 'flex', gap: '8px', alignItems: 'center', background: 'var(--primary-dark)' }}
                >
                  {loading ? <Loader2 className="loading-spinner" /> : <><Save size={20} /> Salvar Paciente</>}
                </button>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewPatient;
