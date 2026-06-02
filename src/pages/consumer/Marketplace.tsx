import { useState } from 'react';
import { PageHeader, Card, Badge, Button } from '../../components/ui';
import { useAsync } from '../../lib/hooks/useAsync';
import { marketplaceService } from '../../lib/services/marketplace';
import { Search } from 'lucide-react';
import './consumer.css';

export default function ConsumerMarketplace() {
  const listings = useAsync(() => marketplaceService.listProduce(), []);
  const [search, setSearch]   = useState('');
  const [typeFilter, setType] = useState('');
  const [ordering, setOrder]  = useState('');
  const [adding, setAdding]   = useState<string|null>(null);
  const [msg, setMsg]         = useState('');

  const all = (listings.data?.results ?? []).filter(p => {
    const s = search.toLowerCase();
    const matchS = !s || p.name.toLowerCase().includes(s) || p.farm_name?.toLowerCase().includes(s) || p.farm_region?.toLowerCase().includes(s);
    const matchT = !typeFilter || p.produce_type === typeFilter;
    return matchS && matchT;
  });

  const handleOrder = async (produceId: string, price: string) => {
    setAdding(produceId); setMsg('');
    try {
      await marketplaceService.createOrder({ total_amount: price } as never);
      setMsg('Order placed successfully! The farmer will confirm shortly.');
    } catch { setMsg('Could not place order. Please try again.'); }
    finally { setAdding(null); }
  };

  return (
    <div>
      <PageHeader title="Marketplace" subtitle="Buy quality poultry produce directly from verified farms." />
      {msg && <p className={msg.includes('success') ? 'form-success' : 'form-error'} style={{marginBottom:'var(--sp-md)'}}>{msg}</p>}

      <div style={{display:'flex',gap:'var(--sp-sm)',marginBottom:'var(--sp-lg)',flexWrap:'wrap'}}>
        <div style={{position:'relative',flex:1,minWidth:200}}>
          <Search size={14} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--col-muted)'}}/>
          <input style={{paddingLeft:32,width:'100%'}} placeholder="Search produce, farm, or region…" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <select value={typeFilter} onChange={e=>setType(e.target.value)} style={{minWidth:140}}>
          <option value="">All types</option>
          {['broiler','layer','eggs','other'].map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
        </select>
        <select value={ordering} onChange={e=>setOrder(e.target.value)} style={{minWidth:140}}>
          <option value="">Sort by</option>
          <option value="price">Price (low–high)</option>
          <option value="-price">Price (high–low)</option>
          <option value="-avg_rating">Top rated</option>
        </select>
      </div>

      {listings.loading
        ? <p style={{color:'var(--col-muted)'}}>Loading produce…</p>
        : all.length === 0
        ? <Card><p style={{padding:'var(--sp-lg)',color:'var(--col-muted)',textAlign:'center'}}>No produce available matching your search.</p></Card>
        : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:'var(--sp-md)'}}>
            {all.map(p => (
              <Card key={p.id} style={{display:'flex',flexDirection:'column',gap:'var(--sp-sm)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                  <Badge variant={p.produce_type==='broiler'?'success':p.produce_type==='eggs'?'info':'neutral'}>
                    {p.produce_type.charAt(0).toUpperCase()+p.produce_type.slice(1)}
                  </Badge>
                  {parseFloat(p.avg_rating)>0 && <span style={{fontSize:12,color:'var(--col-muted)'}}>★ {parseFloat(p.avg_rating).toFixed(1)}</span>}
                </div>
                <strong style={{fontSize:14}}>{p.name}</strong>
                <div style={{fontSize:13,color:'var(--col-muted)'}}>
                  {p.farm_name && <div>{p.farm_name}</div>}
                  {p.farm_region && <div>{p.farm_region}</div>}
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontSize:18,fontWeight:700,color:'var(--col-primary)'}}>GHS {parseFloat(p.price).toLocaleString()}</div>
                    <div style={{fontSize:12,color:'var(--col-muted)'}}>per {p.unit}</div>
                  </div>
                  <div style={{fontSize:13,color:'var(--col-muted)'}}>{p.quantity} {p.unit} avail.</div>
                </div>
                {p.is_organic && <Badge variant="success">🌿 Organic</Badge>}
                <Button disabled={p.status!=='active'||adding===p.id} onClick={()=>handleOrder(p.id, p.price)} style={{marginTop:'auto'}}>
                  {adding===p.id ? 'Ordering…' : p.status==='active' ? 'Order Now' : 'Sold Out'}
                </Button>
              </Card>
            ))}
          </div>
        )}
    </div>
  );
}