import React, { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  pacienteId: string;
}

const ConsultationModal: React.FC<ConsultationModalProps> = ({ isOpen, onClose, onSuccess, pacienteId }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    data_consulta: new Date().toISOString().split('T')[0],
    peso: '',
    cintura: '',
    quadril: '',
    percentual_gordura: '',
    observacoes: '',
    proximo_retorno: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('consultas')
        .insert([{
          paciente_id: pacienteId,
          data_consulta: formData.data_consulta,
          peso: formData.peso ? parseFloat(formData.peso) : null,
          cintura: formData.cintura ? parseFloat(formData.cintura) : null,
          quadril: formData.quadril ? parseFloat(formData.quadril) : null,
          percentual_gordura: formData.percentual_gordura ? parseFloat(formData.percentual_gordura) : null,
          observacoes: formData.observacoes,
          proximo_retorno: formData.proximo_retorno || null
        }]);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar consulta:', err);
      alert('Erro ao salvar consulta.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2>Nova Consulta</h2>
          <button onClick={onClose} className="action-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="data_consulta">Data da Consulta *</label>
              <div className="input-wrapper">
                <input 
                  type="date" 
                  id="data_consulta" 
                  value={formData.data_consulta} 
                  onChange={(e) => setFormData({...formData, data_consulta: e.target.value})}
                  required 
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="peso">Peso (kg) *</label>
              <div className="input-wrapper">
                <input 
                  type="number" 
                  step="0.1" 
                  id="peso" 
                  value={formData.peso} 
                  onChange={(e) => setFormData({...formData, peso: e.target.value})}
                  placeholder="0.0" 
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="cintura">Cintura (cm)</label>
              <div className="input-wrapper">
                <input 
                  type="number" 
                  step="0.1" 
                  id="cintura" 
                  value={formData.cintura} 
                  onChange={(e) => setFormData({...formData, cintura: e.target.value})}
                  placeholder="0.0" 
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="quadril">Quadril (cm)</label>
              <div className="input-wrapper">
                <input 
                  type="number" 
                  step="0.1" 
                  id="quadril" 
                  value={formData.quadril} 
                  onChange={(e) => setFormData({...formData, quadril: e.target.value})}
                  placeholder="0.0" 
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="percentual_gordura">% de Gordura</label>
              <div className="input-wrapper">
                <input 
                  type="number" 
                  step="0.1" 
                  id="percentual_gordura" 
                  value={formData.percentual_gordura} 
                  onChange={(e) => setFormData({...formData, percentual_gordura: e.target.value})}
                  placeholder="0.0" 
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="observacoes">Observações</label>
            <textarea 
              id="observacoes" 
              value={formData.observacoes} 
              onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
              rows={3}
              className="input-wrapper"
              style={{ width: '100%', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '12px' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="proximo_retorno">Próximo Retorno</label>
            <div className="input-wrapper">
              <input 
                type="date" 
                id="proximo_retorno" 
                value={formData.proximo_retorno} 
                onChange={(e) => setFormData({...formData, proximo_retorno: e.target.value})}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn" onClick={onClose} style={{ width: 'auto', background: 'transparent', border: '1px solid var(--border)' }}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
              {loading ? <Loader2 className="loading-spinner" /> : <><Save size={20} /> Salvar Consulta</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConsultationModal;
