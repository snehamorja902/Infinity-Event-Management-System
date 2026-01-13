import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FormContext } from '../contexts/FormContext';

const performersData = [
  { id: 'perf1', name: 'Live DJ', image: 'https://images.unsplash.com/photo-1485217988980-11786ced9454?auto=format&fit=crop&w=800&q=60', price: 15000 },
  { id: 'perf2', name: 'Bollywood Band', image: 'https://images.unsplash.com/photo-1515165562835-c6f7b9cfc5d7?auto=format&fit=crop&w=800&q=60', price: 25000 },
  { id: 'perf3', name: 'Classical Ensemble', image: 'https://images.unsplash.com/photo-1530530827908-3b6f917b36cc?auto=format&fit=crop&w=800&q=60', price: 12000 }
];

const cateringData = [
  { id: 'cat1', name: 'Buffet - Local', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=60', price: 40000 },
  { id: 'cat2', name: 'Plated - Premium', image: 'https://images.unsplash.com/photo-1555992336-03a23c4dbb11?auto=format&fit=crop&w=800&q=60', price: 75000 },
  { id: 'cat3', name: 'Live Counters', image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=800&q=60', price: 60000 }
];

const ServicesPage = () => {
  const { formData, setFormData } = useContext(FormContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedOptions = {}, decorationsTotal = 0, selectedEvents = [], passedForm = null } = location.state || {};

  const [selectedPerformer, setSelectedPerformer] = useState(null);
  const [selectedCatering, setSelectedCatering] = useState(null);

  useEffect(() => {
    // if this page was reached without decoration selections, allow proceeding but warn
    // (no hard redirect - user may want to pick services independently)
  }, []);

  const performersPrice = selectedPerformer ? selectedPerformer.price : 0;
  const cateringPrice = selectedCatering ? selectedCatering.price : 0;
  const servicesTotal = performersPrice + cateringPrice;
  const grandTotal = decorationsTotal + servicesTotal;

  const handleFinish = () => {
    const updated = {
      ...(passedForm || formData || {}),
      decorations: selectedOptions,
      services: {
        performer: selectedPerformer,
        catering: selectedCatering,
        servicesTotal
      }
    };
    if (setFormData) setFormData(updated);

    // Navigate to dashboard and open Performers section
    navigate('/dashboard', { state: { openService: 'Performers' } });
  };

  return (
    <div style={{ maxWidth: 1100, margin: '40px auto', padding: '0 20px' }}>
      <h2 style={{ color: 'var(--color-gold)' }}>Select Services — Performers & Catering</h2>
      <p style={{ color: '#666' }}>Choose performers and a catering package. You can change these later from the dashboard.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, marginTop: 20 }}>
        <div>
          <section style={{ marginBottom: 28 }}>
            <h3 style={{ marginBottom: 12 }}>Performers</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {performersData.map(p => (
                <div key={p.id} onClick={() => setSelectedPerformer(p)} style={{ cursor: 'pointer', borderRadius: 10, overflow: 'hidden', border: selectedPerformer && selectedPerformer.id === p.id ? '3px solid var(--color-gold)' : '1px solid #eee', background: '#fff' }}>
                  <img src={p.image} alt={p.name} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                  <div style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800 }}>{p.name}</div>
                      <div style={{ color: '#666', fontSize: 13 }}>Performer package</div>
                    </div>
                    <div style={{ fontWeight: 800 }}>₹{p.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 style={{ marginBottom: 12 }}>Catering</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {cateringData.map(c => (
                <div key={c.id} onClick={() => setSelectedCatering(c)} style={{ cursor: 'pointer', borderRadius: 10, overflow: 'hidden', border: selectedCatering && selectedCatering.id === c.id ? '3px solid var(--color-gold)' : '1px solid #eee', background: '#fff' }}>
                  <img src={c.image} alt={c.name} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                  <div style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800 }}>{c.name}</div>
                      <div style={{ color: '#666', fontSize: 13 }}>Menu selection</div>
                    </div>
                    <div style={{ fontWeight: 800 }}>₹{c.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside style={{ padding: 18, borderRadius: 12, background: 'linear-gradient(180deg,#fff,#fff)', boxShadow: '0 8px 30px rgba(0,0,0,0.06)', border: '1px solid #f0e9d7' }}>
          <h4 style={{ marginTop: 0 }}>Summary</h4>
          <div style={{ marginBottom: 12 }}>
            <div style={{ color: '#666' }}>Decorations total: <strong>₹{decorationsTotal}</strong></div>
            <div style={{ color: '#666', marginTop: 8 }}>Performers: <strong>₹{performersPrice}</strong></div>
            <div style={{ color: '#666', marginTop: 8 }}>Catering: <strong>₹{cateringPrice}</strong></div>
          </div>

          <div style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 12 }}>Grand Total: ₹{grandTotal}</div>

          <button onClick={handleFinish} disabled={!selectedPerformer && !selectedCatering} style={{ padding: '12px 18px', background: 'var(--color-gold)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', width: '100%', fontWeight: 800 }}>{!selectedPerformer && !selectedCatering ? 'Select a service to continue' : 'Confirm & Finish'}</button>
          <button onClick={()=>navigate('/dashboard')} style={{ marginTop: 10, background: '#fff', border: '1px solid #eee', padding: '10px 12px', width: '100%', borderRadius: 8, cursor: 'pointer' }}>Skip for now</button>
        </aside>
      </div>
    </div>
  );
};

export default ServicesPage;
