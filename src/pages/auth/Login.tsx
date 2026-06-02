import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { authService } from '../../lib/services/auth';
import './Login.css';

type Mode = 'login' | 'register';

const ROLES = [
  { value: 'farmer',   label: '🐔 Poultry Farmer',  desc: 'Apply for credit, manage farm, access training' },
  { value: 'investor', label: '💼 Investor / Partner', desc: 'Fund farmers, track portfolio, view reports' },
  { value: 'consumer', label: '🛒 Consumer / Buyer',  desc: 'Browse and order quality poultry produce' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [mode, setMode] = useState<Mode>('login');

  // ── Login state ───────────────────────────────────────────────
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');

  // ── Register state ────────────────────────────────────────────
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [phone,     setPhone]     = useState('');
  const [role,      setRole]      = useState('farmer');
  const [regEmail,  setRegEmail]  = useState('');
  const [regPass,   setRegPass]   = useState('');
  const [regPass2,  setRegPass2]  = useState('');

  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const switchMode = (m: Mode) => {
    setMode(m); setError(''); setSuccess('');
  };

  // ── Login submit ──────────────────────────────────────────────
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login({ email, password });
      navigate('/');
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(detail ?? 'Invalid email or password. Please try again.');
    } finally { setLoading(false); }
  };

  // ── Register submit ───────────────────────────────────────────
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (regPass !== regPass2) { setError('Passwords do not match.'); return; }
    if (regPass.length < 8)   { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      await authService.register({
        email: regEmail, first_name: firstName, last_name: lastName,
        phone, role, password: regPass, password2: regPass2,
      });
      navigate('/');
    } catch (err: unknown) {
      const data = (err as { response?: { data?: Record<string, string[]> } })?.response?.data;
      if (data) {
        const first = Object.values(data)[0];
        setError(Array.isArray(first) ? first[0] : 'Registration failed. Please check your details.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-page__bg" />

      <div className="login-page__container">
        {/* Header */}
        <div className="login-page__header">
          <div className="login-page__logo-mark">F</div>
          <h1 className="login-page__title">FarmAsyst North</h1>
          <p className="login-page__tagline">
            Agri-fintech platform connecting poultry farmers,<br />
            investors, and markets across northern Ghana.
          </p>
        </div>

        {/* Mode toggle */}
        <div className="auth-toggle">
          <button
            className={`auth-toggle__btn ${mode === 'login' ? 'auth-toggle__btn--active' : ''}`}
            onClick={() => switchMode('login')}
            type="button"
          >
            Sign in
          </button>
          <button
            className={`auth-toggle__btn ${mode === 'register' ? 'auth-toggle__btn--active' : ''}`}
            onClick={() => switchMode('register')}
            type="button"
          >
            Create account
          </button>
        </div>

        {/* ── LOGIN FORM ── */}
        {mode === 'login' && (
          <form className="login-form" onSubmit={handleLogin} noValidate>
            <div className="login-form__field">
              <label htmlFor="email">Email address</label>
              <input
                id="email" type="email" autoComplete="email"
                placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                required disabled={loading}
              />
            </div>
            <div className="login-form__field">
              <label htmlFor="password">Password</label>
              <input
                id="password" type="password" autoComplete="current-password"
                placeholder="Enter your password"
                value={password} onChange={e => setPassword(e.target.value)}
                required disabled={loading}
              />
            </div>
            {error && <p className="login-form__error">{error}</p>}
            <button
              type="submit" className="login-form__submit"
              disabled={loading || !email || !password}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
            <p className="login-form__switch">
              Don't have an account?{' '}
              <button type="button" onClick={() => switchMode('register')}>Create one</button>
            </p>
          </form>
        )}

        {/* ── REGISTER FORM ── */}
        {mode === 'register' && (
          <form className="login-form" onSubmit={handleRegister} noValidate>

            {/* Role selector */}
            <div className="role-picker">
              {ROLES.map(r => (
                <button
                  key={r.value} type="button"
                  className={`role-card ${role === r.value ? 'role-card--active' : ''}`}
                  onClick={() => setRole(r.value)}
                >
                  <span className="role-card__label">{r.label}</span>
                  <span className="role-card__desc">{r.desc}</span>
                </button>
              ))}
            </div>

            {/* Name row */}
            <div className="login-form__row">
              <div className="login-form__field">
                <label htmlFor="firstName">First name</label>
                <input
                  id="firstName" type="text" placeholder="Kofi"
                  value={firstName} onChange={e => setFirstName(e.target.value)}
                  required disabled={loading}
                />
              </div>
              <div className="login-form__field">
                <label htmlFor="lastName">Last name</label>
                <input
                  id="lastName" type="text" placeholder="Mensah"
                  value={lastName} onChange={e => setLastName(e.target.value)}
                  required disabled={loading}
                />
              </div>
            </div>

            <div className="login-form__field">
              <label htmlFor="regEmail">Email address</label>
              <input
                id="regEmail" type="email" placeholder="you@example.com"
                value={regEmail} onChange={e => setRegEmail(e.target.value)}
                required disabled={loading}
              />
            </div>

            <div className="login-form__field">
              <label htmlFor="phone">Phone number (MoMo)</label>
              <input
                id="phone" type="tel" placeholder="024XXXXXXX"
                value={phone} onChange={e => setPhone(e.target.value)}
                required disabled={loading}
              />
            </div>

            {/* Password row */}
            <div className="login-form__row">
              <div className="login-form__field">
                <label htmlFor="regPass">Password</label>
                <input
                  id="regPass" type="password" placeholder="Min. 8 characters"
                  value={regPass} onChange={e => setRegPass(e.target.value)}
                  required disabled={loading}
                />
              </div>
              <div className="login-form__field">
                <label htmlFor="regPass2">Confirm password</label>
                <input
                  id="regPass2" type="password" placeholder="Repeat password"
                  value={regPass2} onChange={e => setRegPass2(e.target.value)}
                  required disabled={loading}
                />
              </div>
            </div>

            {error   && <p className="login-form__error">{error}</p>}
            {success && <p className="login-form__success">{success}</p>}

            <button
              type="submit" className="login-form__submit"
              disabled={loading || !firstName || !lastName || !regEmail || !phone || !regPass || !regPass2}
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>

            <p className="login-form__switch">
              Already have an account?{' '}
              <button type="button" onClick={() => switchMode('login')}>Sign in</button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
