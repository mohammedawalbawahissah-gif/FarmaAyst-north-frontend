interface StubPageProps {
  emoji: string;
  title: string;
  description: string;
  tag?: string;
}

export default function StubPage({ emoji, title, description, tag = 'Coming in Phase 3' }: StubPageProps) {
  return (
    <div className="stub-page">
      <span className="stub-page__icon">{emoji}</span>
      <h2 className="stub-page__title">{title}</h2>
      <p className="stub-page__desc">{description}</p>
      <span className="stub-page__tag">{tag}</span>
    </div>
  );
}
