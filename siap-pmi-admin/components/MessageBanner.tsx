'use client';

type MessageVariant = 'error' | 'success';

type MessageBannerProps = {
  variant: MessageVariant;
  title: string;
  message: string;
  details?: string[];
  actionLabel?: string;
  onAction?: () => void;
};

const stylesByVariant: Record<
  MessageVariant,
  { border: string; background: string; color: string }
> = {
  error: {
    border: '1px solid #f5c6cb',
    background: '#f8d7da',
    color: '#721c24',
  },
  success: {
    border: '1px solid #c8e6c9',
    background: '#e8f5e9',
    color: '#1b5e20',
  },
};

export default function MessageBanner({
  variant,
  title,
  message,
  details,
  actionLabel,
  onAction,
}: MessageBannerProps) {
  const palette = stylesByVariant[variant];
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      style={{
        border: palette.border,
        background: palette.background,
        color: palette.color,
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{title}</div>
      <div>{message}</div>
      {details && details.length > 0 ? (
        <ul style={{ marginTop: 8, paddingLeft: 18 }}>
          {details.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      ) : null}
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          style={{
            marginTop: 8,
            padding: '6px 10px',
            borderRadius: 6,
            border: `1px solid ${palette.color}`,
            background: '#fff',
            cursor: 'pointer',
            color: palette.color,
          }}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
