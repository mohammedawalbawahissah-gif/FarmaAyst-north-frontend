import { type ReactNode } from 'react';
import './components.css';

// ─── Card ────────────────────────────────────────────────────────────────────
interface CardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
export function Card({ children, className = '', style }: CardProps) {
  return (
    <div className={`card ${className}`} style={style}>
      {children}
    </div>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────
type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
}
export function Badge({ children, variant = 'neutral' }: BadgeProps) {
  return <span className={`badge badge--${variant}`}>{children}</span>;
}

// ─── Button ──────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}
export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button className={`btn btn--${variant} btn--${size} ${className}`} {...props}>
      {children}
    </button>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ReactNode;
  accent?: string;
}
export function StatCard({ label, value, sub, icon, accent }: StatCardProps) {
  return (
    <Card className="stat-card">
      <div className="stat-card__header">
        <span className="stat-card__label">{label}</span>
        {icon && (
          <span className="stat-card__icon" style={accent ? { background: accent + '18', color: accent } : {}}>
            {icon}
          </span>
        )}
      </div>
      <div className="stat-card__value">{value}</div>
      {sub && <div className="stat-card__sub">{sub}</div>}
    </Card>
  );
}

// ─── PageHeader ──────────────────────────────────────────────────────────────
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}
export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-header__title">{title}</h1>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      </div>
      {action && <div className="page-header__action">{action}</div>}
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state__icon">{icon}</div>}
      <h3 className="empty-state__title">{title}</h3>
      {description && <p className="empty-state__desc">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}

// ─── SectionTitle ─────────────────────────────────────────────────────────────
export function SectionTitle({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return <h2 className="section-title" style={style}>{children}</h2>;
}
