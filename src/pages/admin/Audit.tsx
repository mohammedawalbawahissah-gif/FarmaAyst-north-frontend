import { PageHeader, Card, Badge, SectionTitle } from '../../components/ui';
import { useAsync } from '../../lib/hooks/useAsync';
import { farmsService } from '../../lib/services/farms';
import { adminService } from '../../lib/services/admin';
import './admin.css';

const OUTCOME_BADGE: Record<string,'success'|'warning'|'danger'> = {
  satisfactory:'success', concerns:'warning', unsatisfactory:'danger',
};

export default function AdminAudit() {
  const audits = useAsync(() => farmsService.listAudits(), []);
  const users  = useAsync(() => adminService.listUsers({ role:'farmer' }), []);
  const farms  = useAsync(() => farmsService.list(), []);

  const farmMap = Object.fromEntries((farms.data?.results ?? []).map(f => [f.id, f]));
  const all = audits.data?.results ?? [];

  const avg = (field: 'infrastructure_score'|'management_score'|'biosecurity_score') =>
    all.length > 0 ? (all.reduce((s,r)=>s+r[field],0)/all.length).toFixed(1) : '—';

  return (
    <div>
      <PageHeader title="Audit & Compliance" subtitle="Field verification reports and farm audit history." />

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'var(--sp-md)',marginBottom:'var(--sp-xl)'}}>
        {[
          {label:'Total Audits',    val:all.length,                                 col:'#1A4A6B'},
          {label:'Avg Infrastructure', val:avg('infrastructure_score')+'/10',        col:'#4A7C2F'},
          {label:'Avg Management',  val:avg('management_score')+'/10',               col:'#E8A020'},
          {label:'Avg Biosecurity', val:avg('biosecurity_score')+'/10',              col:'#5C2D8B'},
        ].map(({label,val,col}) => (
          <Card key={label} style={{padding:'var(--sp-md)'}}>
            <div style={{fontSize:12,color:'var(--col-muted)',marginBottom:4}}>{label}</div>
            <div style={{fontSize:22,fontWeight:700,color:col}}>{val}</div>
          </Card>
        ))}
      </div>

      <SectionTitle>All Audit Reports ({all.length})</SectionTitle>
      <Card>
        {audits.loading
          ? <p style={{padding:'var(--sp-md)',color:'var(--col-muted)'}}>Loading audit records…</p>
          : all.length === 0
          ? <p style={{padding:'var(--sp-md)',color:'var(--col-muted)'}}>No audit reports submitted yet.</p>
          : (
            <table className="data-table">
              <thead><tr><th>Farm</th><th>Visit Date</th><th>Outcome</th><th>Infra</th><th>Mgmt</th><th>Bio</th><th>Flock Verified</th><th>Report</th></tr></thead>
              <tbody>
                {all.map(r => (
                  <tr key={r.id}>
                    <td><strong>{farmMap[r.farm]?.name ?? r.farm}</strong></td>
                    <td>{new Date(r.visit_date).toLocaleDateString('en-GH')}</td>
                    <td><Badge variant={OUTCOME_BADGE[r.outcome]}>{r.outcome.replace('_',' ')}</Badge></td>
                    <td>{r.infrastructure_score}/10</td>
                    <td>{r.management_score}/10</td>
                    <td>{r.biosecurity_score}/10</td>
                    <td>{r.flock_verified.toLocaleString()}</td>
                    <td>{r.report_document ? <a href={r.report_document} target="_blank" rel="noreferrer" style={{fontSize:12}}>View</a> : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </Card>
    </div>
  );
}