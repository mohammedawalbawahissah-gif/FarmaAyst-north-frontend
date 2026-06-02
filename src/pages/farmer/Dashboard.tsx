import { Tractor, TrendingUp, FileText, BookOpen, AlertCircle } from 'lucide-react';
import { PageHeader, StatCard, Card, Badge, Button, SectionTitle } from '../../components/ui';
import { useAuth } from '../../lib/auth-context';
import { useAsync } from '../../lib/hooks/useAsync';
import { creditService } from '../../lib/services/credit';
import { farmsService } from '../../lib/services/farms';
import { paymentsService } from '../../lib/services/payments';
import { trainingService } from '../../lib/services/training';
import './farmer.css';

const STATUS_BADGE: Record<string, 'warning' | 'success' | 'info' | 'neutral' | 'danger'> = {
  draft: 'neutral', submitted: 'info', under_review: 'warning',
  scored: 'warning', matched: 'info', approved: 'success',
  disbursed: 'success', rejected: 'danger', withdrawn: 'neutral',
};
const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft', submitted: 'Submitted', under_review: 'Under Review',
  scored: 'Scored', matched: 'Matched', approved: 'Approved',
  disbursed: 'Disbursed', rejected: 'Rejected', withdrawn: 'Withdrawn',
};

export default function FarmerDashboard() {
  const { user } = useAuth();

  const apps      = useAsync(() => creditService.listApps(), []);
  const farms     = useAsync(() => farmsService.list(), []);
  const schedules = useAsync(() => paymentsService.listSchedules(), []);
  const enrols    = useAsync(() => trainingService.listEnrolments(), []);

  const recentApps     = apps.data?.results.slice(0, 5) ?? [];
  const primaryFarm    = farms.data?.results[0];
  const dueSchedules   = schedules.data?.results.filter(s => s.status === 'pending') ?? [];
  const nextDue        = dueSchedules[0] ?? null;
  const completedMods  = enrols.data?.results.filter(e => e.status === 'completed').length ?? 0;
  const totalMods      = enrols.data?.results.length ?? 0;

  const totalDisbursed = schedules.data?.results.reduce(
    (sum, s) => sum + parseFloat(s.amount_due), 0,
  ) ?? 0;
  const totalRepaid = schedules.data?.results.reduce(
    (sum, s) => sum + parseFloat(s.amount_paid), 0,
  ) ?? 0;
  const repayPct = totalDisbursed > 0 ? Math.round((totalRepaid / totalDisbursed) * 100) : 0;

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.first_name ?? ''} 👋`}
        subtitle="Here's what's happening on your farm today."
        action={<Button size="sm" onClick={() => window.location.href = '/farmer/credit'}>+ New Application</Button>}
      />

      {nextDue && (
        <div className="farmer-alert">
          <AlertCircle size={16} />
          <span>
            Your next repayment of <strong>GHS {parseFloat(nextDue.amount_due).toLocaleString()}</strong> is
            due on {new Date(nextDue.due_date).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}.
          </span>
          <Button size="sm" variant="secondary" onClick={() => window.location.href = '/farmer/repayments'}>
            Pay Now
          </Button>
        </div>
      )}

      <div className="grid-4" style={{ marginBottom: 'var(--sp-xl)' }}>
        <StatCard
          label="Active Credit"
          value={apps.loading ? '…' : `GHS ${(totalDisbursed - totalRepaid).toLocaleString()}`}
          sub={`${apps.data?.results.filter(a => a.status === 'disbursed').length ?? 0} active agreements`}
          icon={<TrendingUp size={16} />}
          accent="#4A7C2F"
        />
        <StatCard
          label="Flock Size"
          value={farms.loading ? '…' : (primaryFarm?.flock_size.toLocaleString() ?? '—')}
          sub={primaryFarm ? `${primaryFarm.flock_type.charAt(0).toUpperCase() + primaryFarm.flock_type.slice(1)} birds` : 'No farm yet'}
          icon={<Tractor size={16} />}
          accent="#E8A020"
        />
        <StatCard
          label="Repayment Rate"
          value={schedules.loading ? '…' : `${repayPct}%`}
          sub="On-time payments"
          icon={<FileText size={16} />}
          accent="#1A4A6B"
        />
        <StatCard
          label="Training Done"
          value={enrols.loading ? '…' : `${completedMods} / ${totalMods}`}
          sub="Modules completed"
          icon={<BookOpen size={16} />}
          accent="#5C2D8B"
        />
      </div>

      <div className="farmer-grid-main">
        <div>
          <SectionTitle>Recent Applications</SectionTitle>
          <Card>
            {apps.loading ? (
              <p style={{ padding: 'var(--sp-md)', color: 'var(--col-muted)' }}>Loading…</p>
            ) : apps.error ? (
              <p style={{ padding: 'var(--sp-md)', color: 'var(--col-danger)' }}>{apps.error}</p>
            ) : recentApps.length === 0 ? (
              <p style={{ padding: 'var(--sp-md)', color: 'var(--col-muted)' }}>
                No applications yet. <a href="/farmer/credit">Apply now →</a>
              </p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th>ID</th><th>Type</th><th>Amount</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {recentApps.map(app => (
                    <tr key={app.id}>
                      <td className="data-table__mono">{app.reference}</td>
                      <td>{app.credit_type.charAt(0).toUpperCase() + app.credit_type.slice(1)}</td>
                      <td><strong>{app.amount_requested ? `GHS ${parseFloat(app.amount_requested).toLocaleString()}` : 'Free'}</strong></td>
                      <td><Badge variant={STATUS_BADGE[app.status]}>{STATUS_LABEL[app.status]}</Badge></td>
                      <td className="data-table__muted">
                        {new Date(app.created_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>

        <div>
          <SectionTitle>Repayment Summary</SectionTitle>
          <Card>
            <div className="repayment-row"><span>Total Disbursed</span><strong>GHS {totalDisbursed.toLocaleString()}</strong></div>
            <div className="repayment-row"><span>Total Repaid</span><strong style={{ color: 'var(--col-success)' }}>GHS {totalRepaid.toLocaleString()}</strong></div>
            <div className="repayment-row"><span>Outstanding Balance</span><strong style={{ color: 'var(--col-danger)' }}>GHS {(totalDisbursed - totalRepaid).toLocaleString()}</strong></div>
            <div className="repayment-progress">
              <div className="repayment-progress__bar" style={{ width: `${repayPct}%` }} />
            </div>
            <p className="repayment-note">
              {repayPct}% repaid{nextDue ? ` — next due ${new Date(nextDue.due_date).toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })}` : ''}
            </p>
            <Button style={{ marginTop: 'var(--sp-md)', width: '100%' }} onClick={() => window.location.href = '/farmer/repayments'}>
              Make a Repayment
            </Button>
          </Card>

          {user && (
            <>
              <SectionTitle style={{ marginTop: 'var(--sp-lg)' }}>Credit Score</SectionTitle>
              <Card className="credit-score-card">
                <div className="credit-score__ring">
                  <span className="credit-score__value">—</span>
                  <span className="credit-score__label">/ 100</span>
                </div>
                <div>
                  <Badge variant={user.is_verified ? 'success' : 'warning'}>
                    {user.is_verified ? 'Verified' : 'Pending Verification'}
                  </Badge>
                  <p className="credit-score__desc">Based on farm activity, repayment history, and verification status.</p>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
