import { READ_ONLY } from '@/shared/config/readOnly';

/**
 * Small fixed-position banner shown in the corner of the screen while the
 * application runs in READ_ONLY (demo) mode. Rendered once inside the main
 * layout so it persists across route changes.
 *
 * When `READ_ONLY` is `false`, this component renders nothing.
 */
export const ReadOnlyBadge = () => {
  if (!READ_ONLY) return null;

  return (
    <div
      aria-live="polite"
      title="Aplikasi sedang dalam mode demo. Semua fitur create/edit/delete dinonaktifkan."
      style={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        zIndex: 9999,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 14px',
        borderRadius: 10,
        fontSize: 12.5,
        fontWeight: 700,
        letterSpacing: '0.02em',
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        color: '#92400e',
        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
        border: '1px solid #fcd34d',
        boxShadow: '0 6px 18px rgba(245, 158, 11, 0.28)',
        pointerEvents: 'none',
        userSelect: 'none',
        animation: 'readOnlyPulse 2.4s ease-in-out infinite',
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#f59e0b',
          display: 'inline-block',
          boxShadow: '0 0 0 3px rgba(245, 158, 11, 0.25)',
          flexShrink: 0,
        }}
      />
      Demo Mode — Read Only
      <style>{`
        @keyframes readOnlyPulse {
          0%, 100% { box-shadow: 0 6px 18px rgba(245, 158, 11, 0.28); }
          50%      { box-shadow: 0 6px 22px rgba(245, 158, 11, 0.42); }
        }
      `}</style>
    </div>
  );
};

export default ReadOnlyBadge;