import { PageHeader, Card, Badge, SectionTitle } from '../../components/ui';
import { useAsync } from '../../lib/hooks/useAsync';
import { creditService } from '../../lib/services/credit';
import { farmsService } from '../../lib/services/farms';
import '../farmer/farmer.css';
import './admin.css';

export default function AdminMatching() {
  const apps  = useAsync(() => creditService.listApps({ status: 'scored' }), []);
  const farms = useAsync(() => farmsService.list(), []);

  const farmMap = Object.fromEntries((farms.data?.results ?? []).map(f => [f.owner, f]));
  const waiting = apps.data?.results ?? [];

  return (
    <div>
      <PageHeader title="Farmer–Investor Matching" subtitle="Match approved farmer applications to suitable investors." />

      <SectionTitle>Applications Ready for Matching ({waiting.length})</SectionTitle>
      {apps.loading
        ? <p style={{color:'var(--col-muted)'}}>Loading…</p>
        : waiting.length === 0
        ? <Card><p style={{padding:'var(--sp-lg)',color:'var(--col-muted)',textAlign:'center'}}>No applications currently awaiting matching.</p></Card>
        : (
          <div style={{display:'flex',flexDirection:'column',gap:'var(--sp-md)'}}>
            {waiting.map(app => {
              const farm = farmMap[app.farmer];
              return (
                <Card key={app.id}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'var(--sp-md)'}}>
                    <div style={{flex:1}}>
                      <div style={{display:'flex',alignItems:'center',gap:'var(--sp-sm)',marginBottom:6}}>
                        <strong>{app.reference}</strong>
                        <Badge variant="warning">{app.status.replace('_',' ')}</Badge>
                        <Badge variant="info">{app.credit_type}</Badge>
                      </div>
                      {app.amount_requested && <div style={{fontSize:13}}>Amount: <strong>GHS {parseFloat(app.amount_requested).toLocaleString()}</strong> · {app.repayment_period_months}mo repayment</div>}
                      <div style={{fontSize:13,color:'var(--col-muted)',margin:'4px 0'}}>{app.purpose}</div>
                      {app.credit_score_at_submission && (
                        <div style={{fontSize:12}}>Credit score at submission: <strong>{app.credit_score_at_submission}</strong></div>
                      )}
                      {farm && (
                        <div style={{fontSize:12,color:'var(--col-muted)',marginTop:4}}>
                          Farm: {farm.name} · {farm.district}, {farm.region} · {farm.flock_size.toLocaleString()} {farm.flock_type}
                        </div>
                      )}
                    </div>
                    <div style={{fontSize:12,color:'var(--col-muted)'}}>
                      Submitted: {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString('en-GH') : '—'}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
    </div>
  );
}