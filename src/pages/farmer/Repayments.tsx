import { useState } from 'react';
import { PageHeader, Card, Badge, Button, SectionTitle, StatCard } from '../../components/ui';
import { useAsync } from '../../lib/hooks/useAsync';
import { paymentsService } from '../../lib/services/payments';
import { creditService } from '../../lib/services/credit';
import './farmer.css';

const SCHEDULE_BADGE: Record<string, 'success'|'danger'|'warning'|'neutral'> = {
  paid: 'success', overdue: 'danger', pending: 'warning', waived: 'neutral',
};

export default function Repayments() {
  const schedules  = useAsync(() => paymentsService.listSchedules(), []);
  const agreements = useAsync(() => creditService.listAgreements(), []);

  const [paying, setPaying]     = useState<string | null>(null);
  const [phone, setPhone]       = useState('');
  const [method, setMethod]     = useState<'momo'|'paystack'>('momo');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const all      = schedules.data?.results ?? [];
  const pending  = all.filter(s => s.status === 'pending');
  const overdue  = all.filter(s => s.status === 'overdue');
  const paid     = all.filter(s => s.status === 'paid');
  const totalDue = pending.reduce((s,r) => s + parseFloat(r.amount_due), 0);
  const totalPaid = paid.reduce((s,r) => s + parseFloat(r.amount_paid), 0);

  const handlePay = async (scheduleId: string) => {
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await paymentsService.initiateRepayment({ schedule_id: scheduleId, method, phone_number: phone });
      if (method === 'paystack' && res.authorization_url) {
        window.open(res.authorization_url, '_blank');
      } else {
        setSuccess('Payment initiated via MoMo. You will receive a prompt on your phone.');
      }
      setPaying(null); schedules.refetch();
    } catch { setError('Payment initiation failed. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <PageHeader title="Repayments" subtitle="View disbursement history, repayment schedules, and make payments." />

      <div className="grid-4" style={{ marginBottom: 'var(--sp-xl)' }}>
        <StatCard label="Total Schedules" value={all.length} sub="All instalments" accent="#1A4A6B" />
        <StatCard label="Pending" value={pending.length} sub={`GHS ${totalDue.toLocaleString()}`} accent="#E8A020" />
        <StatCard label="Overdue" value={overdue.length} sub="Needs immediate attention" accent="#C0392B" />
        <StatCard label="Paid" value={paid.length} sub={`GHS ${totalPaid.toLocaleString()} repaid`} accent="#4A7C2F" />
      </div>

      {error   && <p className="form-error" style={{marginBottom:'var(--sp-md)'}}>{error}</p>}
      {success && <p className="form-success" style={{marginBottom:'var(--sp-md)'}}>{success}</p>}

      {paying && (
        <Card style={{ maxWidth: 420, marginBottom: 'var(--sp-lg)' }}>
          <h3 style={{ marginBottom: 'var(--sp-md)' }}>Initiate Payment</h3>
          <div className="form-field">
            <label>Payment method</label>
            <select value={method} onChange={e => setMethod(e.target.value as 'momo'|'paystack')}>
              <option value="momo">MTN Mobile Money</option>
              <option value="paystack">Card / Bank (Paystack)</option>
            </select>
          </div>
          {method === 'momo' && (
            <div className="form-field">
              <label>MoMo phone number</label>
              <input type="tel" placeholder="024XXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          )}
          <div style={{ display:'flex', gap:'var(--sp-sm)', marginTop:'var(--sp-md)' }}>
            <Button variant="secondary" onClick={() => setPaying(null)}>Cancel</Button>
            <Button disabled={loading || (method==='momo' && !phone)} onClick={() => handlePay(paying)}>
              {loading ? 'Processing…' : 'Confirm Payment'}
            </Button>
          </div>
        </Card>
      )}

      <SectionTitle>Active Agreements</SectionTitle>
      <Card style={{ marginBottom: 'var(--sp-xl)' }}>
        {agreements.loading ? <p style={{padding:'var(--sp-md)',color:'var(--col-muted)'}}>Loading…</p>
        : (agreements.data?.results.length ?? 0) === 0
        ? <p style={{padding:'var(--sp-md)',color:'var(--col-muted)'}}>No active credit agreements.</p>
        : (
          <table className="data-table">
            <thead><tr><th>Ref</th><th>Type</th><th>Amount</th><th>Period</th><th>Status</th><th>Signed</th></tr></thead>
            <tbody>
              {agreements.data!.results.map(ag => (
                <tr key={ag.id}>
                  <td className="data-table__mono">{ag.reference}</td>
                  <td>{ag.credit_type}</td>
                  <td><strong>GHS {parseFloat(ag.amount).toLocaleString()}</strong></td>
                  <td>{ag.repayment_period_months}mo</td>
                  <td><Badge variant={ag.status==='active'?'success':ag.status==='completed'?'info':ag.status==='defaulted'?'danger':'neutral'}>{ag.status.replace('_',' ')}</Badge></td>
                  <td className="data-table__muted">{ag.farmer_signed_at ? '✓ Farmer' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <SectionTitle>Repayment Schedule</SectionTitle>
      <Card>
        {schedules.loading ? <p style={{padding:'var(--sp-md)',color:'var(--col-muted)'}}>Loading…</p>
        : all.length === 0
        ? <p style={{padding:'var(--sp-md)',color:'var(--col-muted)'}}>No repayment schedules yet.</p>
        : (
          <table className="data-table">
            <thead><tr><th>#</th><th>Due Date</th><th>Amount Due</th><th>Amount Paid</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {all.map(s => (
                <tr key={s.id}>
                  <td className="data-table__mono">{s.installment_number}</td>
                  <td>{new Date(s.due_date).toLocaleDateString('en-GH',{day:'numeric',month:'short',year:'numeric'})}</td>
                  <td><strong>GHS {parseFloat(s.amount_due).toLocaleString()}</strong></td>
                  <td style={{color:'var(--col-success)'}}>GHS {parseFloat(s.amount_paid).toLocaleString()}</td>
                  <td><Badge variant={SCHEDULE_BADGE[s.status]}>{s.status}</Badge></td>
                  <td>
                    {s.status === 'pending' || s.status === 'overdue'
                      ? <Button size="sm" onClick={() => { setPaying(s.id); setError(''); setSuccess(''); }}>Pay</Button>
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