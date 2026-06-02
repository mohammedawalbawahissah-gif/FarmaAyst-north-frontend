import { PageHeader, Card, Badge, Button, SectionTitle } from '../../components/ui';
import { useAsync } from '../../lib/hooks/useAsync';
import { creditService } from '../../lib/services/credit';
import { useState } from 'react';
import './investor.css';

const AG_BADGE: Record<string, 'success'|'info'|'danger'|'neutral'|'warning'> = {
  active:'success', completed:'info', defaulted:'danger', cancelled:'neutral', pending_signature:'warning',
};

export default function Contracts() {
  const agreements = useAsync(() => creditService.listAgreements(), []);
  const [signing, setSigning]   = useState<string|null>(null);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const handleSign = async (id: string) => {
    setSigning(id); setError(''); setSuccess('');
    try {
      await creditService.signAgreement(id);
      setSuccess(`Contract ${id.slice(0,8)} signed successfully.`);
      agreements.refetch();
    } catch { setError('Signing failed. Please try again.'); }
    finally { setSigning(null); }
  };

  const ags = agreements.data?.results ?? [];
  const pending = ags.filter(a => a.status === 'pending_signature' && !a.investor_signed_at);

  return (
    <div>
      <PageHeader title="Contracts" subtitle="Generate, sign, and archive investment agreements." />

      {error   && <p className="form-error"   style={{marginBottom:'var(--sp-md)'}}>{error}</p>}
      {success && <p className="form-success" style={{marginBottom:'var(--sp-md)'}}>{success}</p>}

      {pending.length > 0 && (
        <>
          <SectionTitle>Awaiting Your Signature ({pending.length})</SectionTitle>
          <div style={{ display:'flex', flexDirection:'column', gap:'var(--sp-sm)', marginBottom:'var(--sp-xl)' }}>
            {pending.map(ag => (
              <Card key={ag.id} style={{ borderLeft:'3px solid var(--col-warning)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'var(--sp-sm)' }}>
                  <div>
                    <div style={{fontWeight:600}}>{ag.reference} — {ag.credit_type}</div>
                    <div style={{fontSize:13,color:'var(--col-muted)'}}>GHS {parseFloat(ag.amount).toLocaleString()} · {ag.repayment_period_months} months · {ag.interest_rate}% interest</div>
                    <div style={{fontSize:12,color:'var(--col-muted)',marginTop:4}}>
                      Farmer signed: {ag.farmer_signed_at ? '✓ Yes' : '✗ Not yet'} · Investor signed: {ag.investor_signed_at ? '✓ Yes' : '✗ Not yet'}
                    </div>
                  </div>
                  <Button size="sm" disabled={signing === ag.id} onClick={() => handleSign(ag.id)}>
                    {signing === ag.id ? 'Signing…' : 'Sign Contract'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <SectionTitle>All Contracts ({ags.length})</SectionTitle>
      <Card>
        {agreements.loading
          ? <p style={{padding:'var(--sp-md)',color:'var(--col-muted)'}}>Loading…</p>
          : ags.length === 0
          ? <p style={{padding:'var(--sp-md)',color:'var(--col-muted)'}}>No contracts yet.</p>
          : (
            <table className="data-table">
              <thead><tr><th>Reference</th><th>Type</th><th>Amount</th><th>Period</th><th>Status</th><th>Created</th><th>Document</th></tr></thead>
              <tbody>
                {ags.map(ag => (
                  <tr key={ag.id}>
                    <td className="data-table__mono">{ag.reference}</td>
                    <td>{ag.credit_type}</td>
                    <td><strong>GHS {parseFloat(ag.amount).toLocaleString()}</strong></td>
                    <td>{ag.repayment_period_months}mo</td>
                    <td><Badge variant={AG_BADGE[ag.status]}>{ag.status.replace('_',' ')}</Badge></td>
                    <td className="data-table__muted">{new Date(ag.created_at).toLocaleDateString('en-GH')}</td>
                    <td>{ag.contract_document ? <a href={ag.contract_document} target="_blank" rel="noreferrer" style={{fontSize:12}}>Download</a> : <span className="data-table__muted">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </Card>
    </div>
  );
}