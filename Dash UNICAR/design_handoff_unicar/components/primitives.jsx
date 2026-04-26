// UNICAR — shared icons + small UI primitives.
// Outline icons drawn as inline SVG (16px stroke 1.5).

const Icon = ({ name, size = 16, stroke = 1.5, style }) => {
  const common = {
    width: size, height: size,
    viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor',
    strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round',
    style,
  };
  switch (name) {
    case 'dashboard':
      return (<svg {...common}><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>);
    case 'wrench':
      return (<svg {...common}><path d="M14.7 6.3a3.5 3.5 0 0 0 4.6 4.6L21 12.6a1 1 0 0 1 0 1.4l-7 7a1 1 0 0 1-1.4 0l-1.7-1.7a3.5 3.5 0 0 0-4.6-4.6L4 12.4a1 1 0 0 1 0-1.4l7-7a1 1 0 0 1 1.4 0Z"/></svg>);
    case 'car':
      return (<svg {...common}><path d="M3 13l1.6-4.8A2 2 0 0 1 6.5 7h11a2 2 0 0 1 1.9 1.2L21 13"/><path d="M2.5 13h19v4a1 1 0 0 1-1 1H19v1.5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V18H8v1.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V18H3.5a1 1 0 0 1-1-1Z"/><circle cx="7.5" cy="15.5" r="1"/><circle cx="16.5" cy="15.5" r="1"/></svg>);
    case 'users':
      return (<svg {...common}><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19.5a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9" r="2.6"/><path d="M15.5 19.5a4.5 4.5 0 0 1 6.5-4"/></svg>);
    case 'doc':
      return (<svg {...common}><path d="M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8z"/><path d="M14 3v4.5A1.5 1.5 0 0 0 15.5 9H19"/><path d="M9 13h6M9 16h6M9 10h2"/></svg>);
    case 'cash':
      return (<svg {...common}><rect x="2.5" y="6.5" width="19" height="11" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M5.5 9.5h.01M18.5 14.5h.01"/></svg>);
    case 'box':
      return (<svg {...common}><path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9"/></svg>);
    case 'chart':
      return (<svg {...common}><path d="M4 19V5"/><path d="M4 19h16"/><rect x="7" y="11" width="3" height="6"/><rect x="12" y="7" width="3" height="10"/><rect x="17" y="13" width="3" height="4"/></svg>);
    case 'gear':
      return (<svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1A2 2 0 1 1 4.3 17l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.3l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1A2 2 0 1 1 19.7 7l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>);
    case 'plus':
      return (<svg {...common}><path d="M12 5v14M5 12h14"/></svg>);
    case 'search':
      return (<svg {...common}><circle cx="11" cy="11" r="6.5"/><path d="m20 20-3.5-3.5"/></svg>);
    case 'bell':
      return (<svg {...common}><path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>);
    case 'calendar':
      return (<svg {...common}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>);
    case 'arrow-up':
      return (<svg {...common}><path d="M12 19V5M5 12l7-7 7 7"/></svg>);
    case 'arrow-down':
      return (<svg {...common}><path d="M12 5v14M5 12l7 7 7-7"/></svg>);
    case 'check':
      return (<svg {...common}><path d="m4 12 5 5 11-11"/></svg>);
    case 'chevron':
      return (<svg {...common}><path d="m9 6 6 6-6 6"/></svg>);
    case 'chevron-down':
      return (<svg {...common}><path d="m6 9 6 6 6-6"/></svg>);
    case 'menu':
      return (<svg {...common}><path d="M4 6h16M4 12h16M4 18h16"/></svg>);
    case 'filter':
      return (<svg {...common}><path d="M3 5h18l-7 8v6l-4-2v-4z"/></svg>);
    case 'download':
      return (<svg {...common}><path d="M12 4v12M6 12l6 6 6-6M5 21h14"/></svg>);
    case 'print':
      return (<svg {...common}><path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="9" rx="2"/><rect x="7" y="14" width="10" height="7"/></svg>);
    case 'whatsapp':
      return (<svg {...common}><path d="M3 21l1.5-5A8 8 0 1 1 8 19.5z"/><path d="M8.5 9.5c.5 2 2 3.5 4 4l1.2-1a.7.7 0 0 1 .8-.2l1.8.7a.7.7 0 0 1 .4 1c-.6 1-1.7 1.5-2.7 1.3-2.5-.5-4.5-2.5-5-5-.2-1 .3-2.1 1.3-2.7a.7.7 0 0 1 1 .4l.7 1.8a.7.7 0 0 1-.2.8z"/></svg>);
    case 'edit':
      return (<svg {...common}><path d="M4 20h4l10-10-4-4L4 16z"/><path d="M14 6l4 4"/></svg>);
    case 'trash':
      return (<svg {...common}><path d="M4 7h16M9 7V4h6v3M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/></svg>);
    case 'eye':
      return (<svg {...common}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>);
    case 'alert':
      return (<svg {...common}><path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/></svg>);
    case 'clock':
      return (<svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>);
    case 'flag':
      return (<svg {...common}><path d="M5 21V4M5 4h12l-2 4 2 4H5"/></svg>);
    case 'dots':
      return (<svg {...common}><circle cx="6" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18" cy="12" r="1.2"/></svg>);
    case 'phone':
      return (<svg {...common}><path d="M5 4h3l2 5-2 1a11 11 0 0 0 6 6l1-2 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>);
    case 'mail':
      return (<svg {...common}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>);
    case 'pin':
      return (<svg {...common}><path d="M12 21s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>);
    case 'logout':
      return (<svg {...common}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>);
    case 'arrow-left':
      return (<svg {...common}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>);
    case 'sliders':
      return (<svg {...common}><path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg>);
    default:
      return null;
  }
};

// Status pill helpers
const StatusPill = ({ kind, children }) => (
  <span className={`pill ${kind}`}><span className="dot"/>{children}</span>
);

// Sketchy callout/note overlaid on artboard
const Note = ({ x, y, w, n, children }) => (
  <div className="wf-note" style={{ left: x, top: y, maxWidth: w || 180 }}>
    {n != null && <span className="num">{n}</span>}
    <span>{children}</span>
  </div>
);

// Day-count pill (verde / laranja / vermelho)
const DayPill = ({ days }) => {
  const tone = days <= 1 ? 'green' : days <= 3 ? 'amber' : 'red';
  return <span className={`day-pill ${tone}`}>{days}d</span>;
};

// Avatar with initials
const Avatar = ({ name, size = 24, tone }) => {
  const initials = name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
  const bg = tone || ['#3a3a3a','#4a4a4a','#2a2a2a'][name.length % 3];
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color: '#fff',
      display: 'inline-grid', placeItems: 'center',
      fontSize: size * 0.4, fontWeight: 600,
      flexShrink: 0,
    }}>{initials}</span>
  );
};

// Placeholder block
const Placeholder = ({ label, height = 80, style }) => (
  <div className="wf-placeholder" style={{ height, ...style }}>{label}</div>
);

Object.assign(window, { Icon, StatusPill, Note, DayPill, Avatar, Placeholder });
