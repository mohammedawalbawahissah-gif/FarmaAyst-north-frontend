import { useState } from 'react';
import { PageHeader, Card, Button, Badge } from '../../components/ui';
import { useAsync } from '../../lib/hooks/useAsync';
import { farmsService } from '../../lib/services/farms';
import { Search } from 'lucide-react';
import './investor.css';

const FLOCK_TYPES = ['','broilers','layers','mixed'];
const REGIONS = ['','Northern Region','Upper East Region','Upper West Region','Savannah Region'];

export default function BrowseFarmers() {
  const farms = useAsync(() => farmsService.list(), []);
  const [search, setSearch]     = useState('');
  const [flockFilter, setFlock] = useState('');
  const [regionFilter, setRegion] = useState('');

  const filtered = (farms.data?.results ?? []).filter(f => {
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.district.toLowerCase().includes(search.toLowerCase());
    const matchFlock  = !flockFilter || f.flock_type === flockFilter;
    const matchRegion = !regionFilter || f.region === regionFilter;
    return matchSearch && matchFlock && matchRegion;
  });

  return (
    <div>
      <PageHeader title="Browse Farmers" subtitle="Discover verified farmer profiles and creditworthiness data." />

      <div style={{ display:'flex', gap:'var(--sp-sm)', marginBottom:'var(--sp-lg)', flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <Search size={14} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--col-muted)' }} />
          <input style={{ paddingLeft:32, width:'100%' }} placeholder="Search by name or district…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={flockFilter} onChange={e => setFlock(e.target.value)} style={{minWidth:140}}>
          {FLOCK_TYPES.map(t => <option key={t} value={t}>{t || 'All flock types'}</option>)}
        </select>
        <select value={regionFilter} onChange={e => setRegion(e.target.value)} style={{minWidth:180}}>
          {REGIONS.map(r => <option key={r} value={r}>{r || 'All regions'}</option>)}
        </select>
      </div>

      {farms.loading
        ? <p style={{color:'var(--col-muted)'}}>Loading farmer profiles…</p>
        : filtered.length === 0
        ? <Card><p style={{padding:'var(--sp-lg)',color:'var(--col-muted)',textAlign:'center'}}>No farmers match your filters.</p></Card>
        : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'var(--sp-md)' }}>
            {filtered.map(f => (
              <Card key={f.id} style={{ display:'flex', flexDirection:'column', gap:'var(--sp-sm)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-sm)', marginBottom:'var(--sp-xs)' }}>
                  <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--col-primary)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, flexShrink:0 }}>
                    {f.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{fontWeight:600,fontSize:14}}>{f.name}</div>
                    <div style={{fontSize:12,color:'var(--col-muted)'}}>{f.district}, {f.region}</div>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--sp-xs)', fontSize:13 }}>
                  <div><span style={{color:'var(--col-muted)'}}>Flock type</span><br/><strong>{f.flock_type}</strong></div>
                  <div><span style={{color:'var(--col-muted)'}}>Flock size</span><br/><strong>{f.flock_size.toLocaleString()}</strong></div>
                  <div><span style={{color:'var(--col-muted)'}}>Community</span><br/><strong>{f.community || '—'}</strong></div>
                  <div><span style={{color:'var(--col-muted)'}}>Status</span><br/><Badge variant={f.is_active?'success':'neutral'}>{f.is_active?'Active':'Inactive'}</Badge></div>
                </div>
                <div style={{display:'flex',gap:'var(--sp-xs)',marginTop:'var(--sp-xs)'}}>
                  {f.has_water_source && <Badge variant="info">💧 Water</Badge>}
                  {f.has_electricity  && <Badge variant="info">⚡ Power</Badge>}
                </div>
                <Button size="sm" style={{marginTop:'auto'}}>View Full Profile</Button>
              </Card>
            ))}
          </div>
        )}
    </div>
  );
}