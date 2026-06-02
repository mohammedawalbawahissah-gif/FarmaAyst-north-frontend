import { useState } from 'react';
import { PageHeader, Card, Badge, Button, SectionTitle } from '../../components/ui';
import { useAsync } from '../../lib/hooks/useAsync';
import { creditService } from '../../lib/services/credit';
import '../farmer/farmer.css';
import './admin.css';

const STATUS_BADGE: Record<string,'success'|'warning'|'danger'|'neutral'|'info'> = {
  draft:'neutral', submitted:'info', under_review:'warning', scored:'warning',
  matched:'info', approved:'success', disbursed:'success', rejected:'danger', withdrawn:'neutral',
};

export default function AdminCreditWorkflow() {
  const apps = useAsync(() => creditService.listApps(), []);
  const [filter, setFilter]   = useState('');
  const [acting, setActing]   = useState<string|null>(null);
  const [notes, setNotes]     = useState('');
  const [reason, setReason]   = useState('');
  const [reviewing, setReview]= useState<string|null>(null);
  const [msg, setMsg]         = useState('');

  const all = (apps.data?.results ?? []).filter(a => !filter || a.status === filter);

  const handle = async (action: 'approve'|'reject', id: string) => {
    setActing(id); setMsg('');
    try {
      if (action === 'approve') await creditService.approveApp(id, notes);
      if (action === 'reject')  await creditService.rejectApp(id, reason, notes);
      setMsg(`Application ${action}d.`);
      setReview(null); setNotes(''); setReason('');
      apps.refetch();
    } catch { setMsg('Action failed. Please try again.'); }
    finally { setActing(null); }
  };

  const statusCounts = (apps.data?.results ?? []).reduce((acc,a)=>{acc[a.status]=(acc[a.status]||0)+1;return acc;},{} as Record<string,number>);

  return (
    <div>
      <PageHeader title="Credit Workflow" subtitle="Review, approve, and manage all credit applications." />
      {msg && <p className="form-success" style={{marginBottom:'var(--sp-md)'}}>{msg}</p>}

      <div style={{display:'flex',gap:'var(--sp-sm)',flexWrap:'wrap',marginBottom:'var(--sp-lg)'}}>
        {[['','All',apps.data?.count??0],['submitted','Submitted',statusCounts['submitted']??0],
          ['under_review','Under Review',statusCounts['under_review']??0],['approved','Approved',statusCounts['approved']??0],
          ['rejected','Rejected',statusCounts['rejected']??0]].map(([val,label,count]) => (
          <Button key={val as string} size="sm" variant={filter===val?'primary':'ghost'} onClick={()=>setFilter(val as string)}>
            {label as string} ({count as number})
          </Button>
        ))}
      </div>

      {reviewing && (
        <Card style={{maxWidth:480,marginBottom:'var(--sp-lg)'}}>
          <h3 style={{marginBottom:'var(--sp-md)'}}>Review Application</h3>
          <div className="form-field">
            <label>Notes</label>
            <textarea rows={3} placeholder="Add review notes (optional)…" value={notes} onChange={e=>setNotes(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Rejection reason (required only if rejecting)</label>
            <input placeholder="Reason for rejection…" value={reason} onChange={e=>setReason(e.target.value)} />
          </div>
          <div style={{display:'flex',gap:'var(--sp-sm)'}}>
            <Button variant="secondary" onClick={()=>setReview(null)}>Cancel</Button>
            <Button disabled={acting===reviewing} onClick={()=>handle('approve',reviewing)}>Approve ✓</Button>
            <Button variant="danger" disabled={!reason||acting===reviewing} onClick={()=>handle('reject',reviewing)}>Reject ✗</Button>
          </div>
        </Card>
      )}

      <Card>
        {apps.loading
          ? <p style={{padding:'var(--sp-md)',color:'var(--col-muted)'}}>Loading…</p>
          : all.length === 0
          ? <p style={{padding:'var(--sp-md)',color:'var(--col-muted)'}}>No applications match this filter.</p>
          : (
            <table className="data-table">
              <thead><tr><th>Ref</th><th>Farmer</th><th>Type</th><th>Amount</th><th>Status</th><th>Submitted</th><th>Action</th></tr></thead>
              <tbody>
                {all.map(app => (
                  <tr key={app.id}>
                    <td className="data-table__mono">{app.reference}</td>
                    <td><strong>{app.farmer}</strong></td>
                    <td>{app.credit_type}</td>
                    <td>{app.amount_requested ? `GHS ${parseFloat(app.amount_requested).toLocaleString()}` : 'Free'}</td>
                    <td><Badge variant={STATUS_BADGE[app.status]??'neutral'}>{app.status.replace('_',' ')}</Badge></td>
                    <td className="data-table__muted">{app.submitted_at ? new Date(app.submitted_at).toLocaleDateString('en-GH') : '—'}</td>
                    <td>
                      {['submitted','under_review','scored','matched'].includes(app.status)
                        ? <Button size="sm" onClick={()=>setReview(app.id)}>Review</Button>
                        : <span className="data-table__muted">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </Card>
    </div>
  );
}