import { useState } from 'react';
import { PageHeader, Card, Badge, Button, SectionTitle } from '../../components/ui';
import { useAsync } from '../../lib/hooks/useAsync';
import { marketplaceService } from '../../lib/services/marketplace';
import { farmsService } from '../../lib/services/farms';
import './farmer.css';

const PRODUCE_TYPES = ['broiler','layer','eggs','other'];

export default function FarmerMarketplace() {
  const listings = useAsync(() => marketplaceService.listProduce(), []);
  const orders   = useAsync(() => marketplaceService.listOrders(), []);
  const farms    = useAsync(() => farmsService.list(), []);

  const [showForm, setShowForm]   = useState(false);
  const [farmId, setFarmId]       = useState('');
  const [name, setName]           = useState('');
  const [type, setType]           = useState('broiler');
  const [qty, setQty]             = useState('');
  const [unit, setUnit]           = useState('kg');
  const [price, setPrice]         = useState('');
  const [desc, setDesc]           = useState('');
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  const handleCreate = async () => {
    if (!name || !qty || !price) return;
    setSaving(true); setError('');
    try {
      await marketplaceService.createProduce({ name, produce_type: type as never, quantity: parseInt(qty), unit, price, description: desc, ...(farmId && { farm: farmId as never }) });
      setShowForm(false); setName(''); setQty(''); setPrice(''); setDesc('');
      listings.refetch();
    } catch { setError('Could not create listing.'); }
    finally { setSaving(false); }
  };

  const myListings = listings.data?.results ?? [];
  const myOrders   = orders.data?.results ?? [];

  return (
    <div>
      <PageHeader title="Marketplace" subtitle="List your produce and manage orders from buyers."
        action={<Button size="sm" onClick={() => setShowForm(s => !s)}>{showForm ? 'Cancel' : '+ New Listing'}</Button>} />

      {showForm && (
        <Card style={{ maxWidth: 560, marginBottom: 'var(--sp-xl)' }}>
          <h3 style={{ marginBottom: 'var(--sp-md)' }}>New Produce Listing</h3>
          {error && <p className="form-error">{error}</p>}
          <div className="form-row">
            <div className="form-field">
              <label>Name <span className="required">*</span></label>
              <input placeholder="e.g. Fresh Broilers" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Type</label>
              <select value={type} onChange={e => setType(e.target.value)}>
                {PRODUCE_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Quantity <span className="required">*</span></label>
              <input type="number" min="1" placeholder="e.g. 50" value={qty} onChange={e => setQty(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Unit</label>
              <select value={unit} onChange={e => setUnit(e.target.value)}>
                {['kg','crate','bird','dozen','bag'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Price (GHS) <span className="required">*</span></label>
              <input type="number" min="0" step="0.01" placeholder="e.g. 45.00" value={price} onChange={e => setPrice(e.target.value)} />
            </div>
          </div>
          {farms.data && farms.data.results.length > 0 && (
            <div className="form-field">
              <label>Farm</label>
              <select value={farmId} onChange={e => setFarmId(e.target.value)}>
                <option value="">— Select farm —</option>
                {farms.data.results.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
          )}
          <div className="form-field">
            <label>Description</label>
            <textarea rows={2} placeholder="Describe the produce quality, weight range, availability…" value={desc} onChange={e => setDesc(e.target.value)} />
          </div>
          <Button disabled={!name||!qty||!price||saving} onClick={handleCreate} style={{width:'100%'}}>
            {saving ? 'Publishing…' : 'Publish Listing'}
          </Button>
        </Card>
      )}

      <SectionTitle>My Listings ({myListings.length})</SectionTitle>
      <Card style={{ marginBottom: 'var(--sp-xl)' }}>
        {listings.loading ? <p style={{padding:'var(--sp-md)',color:'var(--col-muted)'}}>Loading…</p>
        : myListings.length === 0
        ? <p style={{padding:'var(--sp-md)',color:'var(--col-muted)'}}>No listings yet. Add your first produce listing above.</p>
        : (
          <table className="data-table">
            <thead><tr><th>Name</th><th>Type</th><th>Qty</th><th>Price</th><th>Status</th><th>Rating</th></tr></thead>
            <tbody>
              {myListings.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.produce_type}</td>
                  <td>{p.quantity} {p.unit}</td>
                  <td>GHS {parseFloat(p.price).toLocaleString()}</td>
                  <td><Badge variant={p.status==='active'?'success':p.status==='sold_out'?'warning':'neutral'}>{p.status.replace('_',' ')}</Badge></td>
                  <td>{parseFloat(p.avg_rating) > 0 ? `★ ${parseFloat(p.avg_rating).toFixed(1)}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <SectionTitle>Incoming Orders ({myOrders.length})</SectionTitle>
      <Card>
        {orders.loading ? <p style={{padding:'var(--sp-md)',color:'var(--col-muted)'}}>Loading…</p>
        : myOrders.length === 0
        ? <p style={{padding:'var(--sp-md)',color:'var(--col-muted)'}}>No orders received yet.</p>
        : (
          <table className="data-table">
            <thead><tr><th>Order ID</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {myOrders.map(o => (
                <tr key={o.id}>
                  <td className="data-table__mono">{o.id.slice(0,8)}…</td>
                  <td><strong>GHS {parseFloat(o.total_amount).toLocaleString()}</strong></td>
                  <td><Badge variant={o.status==='delivered'?'success':o.status==='cancelled'?'danger':o.status==='confirmed'?'info':'warning'}>{o.status}</Badge></td>
                  <td className="data-table__muted">{new Date(o.created_at).toLocaleDateString('en-GH')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}