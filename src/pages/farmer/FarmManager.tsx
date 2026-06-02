import { useState } from 'react';
import { PageHeader, Card, Button, SectionTitle, Badge } from '../../components/ui';
import { useAsync } from '../../lib/hooks/useAsync';
import { farmsService } from '../../lib/services/farms';
import './farmer.css';

export default function FarmManager() {
  const farms = useAsync(() => farmsService.list(), []);
  const [selectedFarm, setSelectedFarm] = useState('');

  const farmId = selectedFarm || (farms.data?.results[0]?.id ?? '');
  const logs = useAsync(
    () => farmId ? farmsService.listLogs(farmId) : Promise.resolve(null),
    [farmId],
  );

  const [date, setDate]           = useState(new Date().toISOString().split('T')[0]);
  const [flockCount, setFlockCount] = useState('');
  const [mortality, setMortality] = useState('0');
  const [feedKg, setFeedKg]       = useState('');
  const [eggs, setEggs]           = useState('0');
  const [meds, setMeds]           = useState('');
  const [notes, setNotes]         = useState('');
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  const handleLog = async () => {
    if (!farmId || !flockCount) return;
    setSaving(true); setError(''); setSuccess('');
    try {
      await farmsService.createLog(farmId, {
        date, flock_count: parseInt(flockCount), mortality: parseInt(mortality),
        feed_kg: feedKg, eggs_collected: parseInt(eggs),
        medication_given: meds, notes,
      });
      setSuccess('Activity logged successfully!');
      setFlockCount(''); setMortality('0'); setFeedKg(''); setEggs('0'); setMeds(''); setNotes('');
      logs.refetch();
    } catch {
      setError('Failed to save log. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const farmList = farms.data?.results ?? [];
  const activeFarm = farmList.find(f => f.id === farmId);

  return (
    <div>
      <PageHeader title="Farm Manager" subtitle="Log daily farm activity — flock count, feed, mortality, and more." />

      {farmList.length > 1 && (
        <div className="form-field" style={{ maxWidth: 320, marginBottom: 'var(--sp-lg)' }}>
          <label>Select farm</label>
          <select value={selectedFarm} onChange={e => setSelectedFarm(e.target.value)}>
            {farmList.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
      )}

      {farms.loading ? (
        <p style={{ color: 'var(--col-muted)' }}>Loading farms…</p>
      ) : farmList.length === 0 ? (
        <Card><p style={{ padding: 'var(--sp-md)', color: 'var(--col-muted)' }}>You have no registered farms yet. Please contact FarmAsyst North to register your farm.</p></Card>
      ) : (
        <div className="farmer-grid-main">
          {/* Log form */}
          <div>
            <SectionTitle>Log Today's Activity — {activeFarm?.name}</SectionTitle>
            <Card>
              {error   && <p className="form-error">{error}</p>}
              {success && <p className="form-success">{success}</p>}

              <div className="form-field">
                <label>Date</label>
                <input type="date" value={date} max={new Date().toISOString().split('T')[0]} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Flock count <span className="required">*</span></label>
                  <input type="number" min="0" placeholder="e.g. 850" value={flockCount} onChange={e => setFlockCount(e.target.value)} />
                </div>
                <div className="form-field">
                  <label>Mortality</label>
                  <input type="number" min="0" placeholder="0" value={mortality} onChange={e => setMortality(e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Feed consumed (kg)</label>
                  <input type="number" min="0" step="0.1" placeholder="e.g. 25.5" value={feedKg} onChange={e => setFeedKg(e.target.value)} />
                </div>
                <div className="form-field">
                  <label>Eggs collected</label>
                  <input type="number" min="0" placeholder="0" value={eggs} onChange={e => setEggs(e.target.value)} />
                </div>
              </div>
              <div className="form-field">
                <label>Medication given</label>
                <input type="text" placeholder="e.g. Newcastle vaccine — 0.5ml per bird" value={meds} onChange={e => setMeds(e.target.value)} />
              </div>
              <div className="form-field">
                <label>Additional notes</label>
                <textarea rows={3} placeholder="Anything else to note about today's activity…" value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
              <Button disabled={!flockCount || saving} onClick={handleLog} style={{ width: '100%', marginTop: 'var(--sp-sm)' }}>
                {saving ? 'Saving…' : 'Save Activity Log'}
              </Button>
            </Card>
          </div>

          {/* Recent logs */}
          <div>
            <SectionTitle>Recent Activity Logs</SectionTitle>
            <Card>
              {logs.loading ? (
                <p style={{ padding: 'var(--sp-md)', color: 'var(--col-muted)' }}>Loading logs…</p>
              ) : (logs.data?.results.length ?? 0) === 0 ? (
                <p style={{ padding: 'var(--sp-md)', color: 'var(--col-muted)' }}>No logs yet. Start logging daily activity above.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr><th>Date</th><th>Flock</th><th>Mortality</th><th>Feed (kg)</th><th>Eggs</th></tr>
                  </thead>
                  <tbody>
                    {logs.data!.results.slice(0, 14).map(log => (
                      <tr key={log.id}>
                        <td className="data-table__mono">{new Date(log.date).toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })}</td>
                        <td><strong>{log.flock_count.toLocaleString()}</strong></td>
                        <td>
                          <span style={{ color: log.mortality > 0 ? 'var(--col-danger)' : 'inherit' }}>
                            {log.mortality}
                          </span>
                        </td>
                        <td>{log.feed_kg ?? '—'}</td>
                        <td>{log.eggs_collected}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>

            {activeFarm && (
              <>
                <SectionTitle style={{ marginTop: 'var(--sp-lg)' }}>Farm Overview</SectionTitle>
                <Card>
                  <div className="repayment-row"><span>Farm name</span><strong>{activeFarm.name}</strong></div>
                  <div className="repayment-row"><span>Location</span><strong>{activeFarm.district}, {activeFarm.region}</strong></div>
                  <div className="repayment-row"><span>Flock type</span><strong>{activeFarm.flock_type}</strong></div>
                  <div className="repayment-row"><span>Current flock size</span><strong>{activeFarm.flock_size.toLocaleString()}</strong></div>
                  <div className="repayment-row"><span>Status</span><Badge variant={activeFarm.is_active ? 'success' : 'neutral'}>{activeFarm.is_active ? 'Active' : 'Inactive'}</Badge></div>
                </Card>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
