import { Users, FileCheck, AlertCircle, TrendingUp, BarChart3, UserCheck } from 'lucide-react';
import { PageHeader, StatCard, Card, Button, SectionTitle, Badge } from '../../components/ui';
import { useAsync } from '../../lib/hooks/useAsync';
import { adminService } from '../../lib/services/admin';
import { creditService } from '../../lib/services/credit';
import { notificationsService } from '../../lib/services/notifications';
import '../farmer/farmer.css';
import './admin.css';

const STATUS_BADGE: Record<string,("success"|"warning"|"danger"|"neutral"|"info")> = {
  submitted:'info', under_review:'warning', scored:'warning',
  matched:'info', approved:'success', disbursed:'success', rejected:'danger',
};

export default function AdminDashboard() {
  const users    = useAsync(() => adminService.listUsers(), []);
  const apps     = useAsync(() => creditService.listApps(), []);
  const notifs   = useAsync(() => notificationsService.list(), []);

  const allUsers  = users.data?.results ?? [];
  const allApps   = apps.data?.results ?? [];
  const pending   = allApps.filter(a => ['submitted','under_review','scored'].includes(a.status));
  const farmers   = allUsers.filter(u => u.role === 'farmer');
  const investors = allUsers.filter(u => u.role === 'investor');

  return (
    <div>
      <PageHeader title="Platform Overview" subtitle="FarmAsyst North admin panel — manage credit, users, and operations." />

      <div className="grid-4" style={{ marginBottom:'var(--sp-xl)' }}>
        <StatCard label="Total Farmers"   value={farmers.length}   sub={`${farmers.filter(u=>u.is_verified).length} verified`} icon={<Users size={16}/>} accent="#5C2D8B" />
        <StatCard label="Total Investors" value={investors.length} sub="Registered partners" icon={<TrendingUp size={16}/>} accent="#1A4A6B" />
        <StatCard label="Pending Review"  value={pending.length}   sub="Applications awaiting" icon={<FileCheck size={16}/>} accent="#E8A020" />
        <StatCard label="Unread Alerts"   value={notifs.data?.results.filter(n=>!n.is_read).length ?? 0} sub="Platform notifications" icon={<AlertCircle size={16}/>} accent="#C0392B" />
      </div>

      <div className="admin-grid-main">
        <div>
          <SectionTitle>Pending Credit Applications</SectionTitle>
          <Card>
            {apps.loading
              ? <p style={{padding:'var(--sp-md)',color:'var(--col-muted)'}}>Loading…</p>
              : pending.length === 0
              ? <p style={{padding:'var(--sp-md)',color:'var(--col-muted)'}}>No pending applications.</p>
              : (
                <table className="data-table">
                  <thead><tr><th>Ref</th><th>Farmer</th><th>Type</th><th>Amount</th><th>Status</th><th>Submitted</th><th>Action</th></tr></thead>
                  <tbody>
                    {pending.slice(0,8).map(app => (
                      <tr key={app.id}>
                        <td className="data-table__mono">{app.reference}</td>
                        <td><strong>{app.farmer}</strong></td>
                        <td>{app.credit_type}</td>
                        <td>{app.amount_requested ? `GHS ${parseFloat(app.amount_requested).toLocaleString()}` : 'Free'}</td>
                        <td><Badge variant={STATUS_BADGE[app.status] ?? 'neutral'}>{app.status.replace('_',' ')}</Badge></td>
                        <td className="data-table__muted">{app.submitted_at ? new Date(app.submitted_at).toLocaleDateString('en-GH') : '—'}</td>
                        <td><Button size="sm" onClick={() => window.location.href='/admin/credit'}>Review</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
          </Card>
        </div>

        <div>
          <SectionTitle>Platform Health</SectionTitle>
          <Card>
            <div className="health-row"><BarChart3 size={16}/><span>Total Applications</span><strong>{allApps.length}</strong></div>
            <div className="health-row"><UserCheck size={16}/><span>Verified Farmers</span><strong>{farmers.filter(u=>u.is_verified).length} / {farmers.length}</strong></div>
            <div className="health-row"><Users size={16}/><span>Active Investors</span><strong>{investors.length}</strong></div>
            <div className="health-row"><FileCheck size={16}/><span>Approved Apps</span><strong>{allApps.filter(a=>['approved','disbursed'].includes(a.status)).length}</strong></div>
            <div className="health-row"><AlertCircle size={16}/><span>Rejected Apps</span><strong style={{color:'var(--col-danger)'}}>{allApps.filter(a=>a.status==='rejected').length}</strong></div>
          </Card>

          <SectionTitle style={{marginTop:'var(--sp-lg)'}}>User Breakdown</SectionTitle>
          <Card>
            {(['farmer','investor','consumer','admin'] as const).map(role => {
              const count = allUsers.filter(u => u.role === role).length;
              return (
                <div key={role} className="repayment-row">
                  <span style={{textTransform:'capitalize'}}>{role}s</span>
                  <strong>{count}</strong>
                </div>
              );
            })}
          </Card>
        </div>
      </div>
    </div>
  );
}