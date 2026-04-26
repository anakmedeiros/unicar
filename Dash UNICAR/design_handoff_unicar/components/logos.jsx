// UNICAR — Logo concept explorations.
// 4 horizontal versions + 4 square icons. Mid-fi: red + black.

const LogoSet = ({ variant = 'gear' }) => {
  const styles = {
    horiz: {
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '24px 32px',
      background: '#fff',
      border: '1px solid var(--line-2)',
      borderRadius: 6,
    },
    iconBox: {
      width: 120, height: 120,
      display: 'grid', placeItems: 'center',
      background: variant === 'inverse' ? '#111' : '#fff',
      border: '1px solid var(--line-2)',
      borderRadius: 6,
    },
    word: {
      fontFamily: 'Inter, sans-serif',
      fontWeight: 800,
      fontSize: 38,
      letterSpacing: '-0.02em',
      color: '#111',
      lineHeight: 1,
    },
    sub: {
      fontFamily: 'Inter, sans-serif',
      fontSize: 9,
      letterSpacing: '0.32em',
      color: '#666',
      textTransform: 'uppercase',
      marginTop: 4,
    },
  };

  return null;
};

// Mark variants — pure SVG glyphs, no helpers, just stroke + fill.

const MarkGear = ({ size = 56, fill = '#E31E2D', secondary = '#111' }) => (
  // Engrenagem com 'U' invertido formando o centro
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    {/* Outer gear silhouette */}
    <path d="M32 4 L37 8 L43 7 L46 12 L52 14 L52 20 L57 24 L55 30 L60 34 L57 40 L60 46 L55 50 L52 56 L46 56 L43 60 L37 59 L32 64 L27 59 L21 60 L18 56 L12 56 L12 50 L7 46 L10 40 L4 34 L7 30 L4 24 L9 20 L12 14 L18 12 L21 7 L27 8 Z" fill={fill}/>
    {/* Inner cut */}
    <circle cx="32" cy="32" r="14" fill="#fff"/>
    {/* U mark inside */}
    <path d="M22 22 L22 36 a10 10 0 0 0 20 0 L42 22" stroke={secondary} strokeWidth="4" fill="none" strokeLinecap="square"/>
  </svg>
);

const MarkWrench = ({ size = 56, fill = '#E31E2D', secondary = '#111' }) => (
  // Chave de boca em ângulo formando 'U'
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect x="2" y="2" width="60" height="60" rx="8" fill={secondary}/>
    {/* Wrench */}
    <path d="M14 18 a8 8 0 1 1 11.3 11.3 L40 44 l6 -6 L31.3 23.3 A8 8 0 0 1 22 12 L26 16 L22 20 L18 16 Z"
          transform="rotate(-30 32 32)"
          fill={fill}/>
    {/* small accent line */}
    <rect x="10" y="50" width="44" height="2" fill="#fff" opacity="0.2"/>
  </svg>
);

const MarkSpeed = ({ size = 56, fill = '#E31E2D', secondary = '#111' }) => (
  // Velocímetro / abstrato 'U'
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="28" fill={secondary}/>
    <path d="M14 38 a18 18 0 0 1 36 0" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <path d="M14 38 a18 18 0 0 1 12 -17" stroke={fill} strokeWidth="4" fill="none" strokeLinecap="round"/>
    {/* needle */}
    <line x1="32" y1="38" x2="44" y2="22" stroke={fill} strokeWidth="3" strokeLinecap="round"/>
    <circle cx="32" cy="38" r="3" fill="#fff"/>
  </svg>
);

const MarkAbstract = ({ size = 56, fill = '#E31E2D', secondary = '#111' }) => (
  // Carro abstrato formado por blocos angulares + acento vermelho
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect x="2" y="2" width="60" height="60" rx="8" fill="#fff" stroke={secondary} strokeWidth="2"/>
    {/* car body */}
    <path d="M10 38 L18 22 L46 22 L54 38 Z" fill={secondary}/>
    <path d="M22 22 L26 14 L38 14 L42 22 Z" fill={secondary}/>
    {/* red stripe */}
    <rect x="10" y="38" width="44" height="3" fill={fill}/>
    {/* wheels */}
    <circle cx="20" cy="46" r="5" fill={secondary}/>
    <circle cx="44" cy="46" r="5" fill={secondary}/>
    <circle cx="20" cy="46" r="2" fill="#fff"/>
    <circle cx="44" cy="46" r="2" fill="#fff"/>
  </svg>
);

const Wordmark = ({ size = 38, mono = false }) => (
  <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
    <span style={{
      fontFamily: 'Inter, sans-serif',
      fontWeight: 900,
      fontSize: size,
      letterSpacing: '-0.03em',
      color: mono ? '#111' : '#111',
    }}>
      UNI<span style={{ color: '#E31E2D' }}>CAR</span>
    </span>
    <span style={{
      fontFamily: 'Inter, sans-serif',
      fontSize: Math.round(size * 0.21),
      letterSpacing: '0.34em',
      color: '#666',
      textTransform: 'uppercase',
      marginTop: 5,
      paddingLeft: 2,
    }}>
      Auto Center · est. 2008
    </span>
  </div>
);

const LogoCard = ({ name, mark: Mark, label, isSquare }) => (
  <div style={{
    background: '#fff',
    border: '1px solid #e3e0d9',
    borderRadius: 6,
    padding: 24,
    display: 'flex', flexDirection: 'column', gap: 16,
    minHeight: isSquare ? 0 : 220,
  }}>
    {/* horizontal lockup */}
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '20px 8px',
      borderBottom: '1px dashed #e3e0d9',
    }}>
      <Mark size={56}/>
      <Wordmark size={32}/>
    </div>

    {/* square icon */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 80, height: 80,
        display: 'grid', placeItems: 'center',
        background: '#111',
        borderRadius: 8,
      }}>
        <Mark size={48}/>
      </div>
      <div style={{
        width: 80, height: 80,
        display: 'grid', placeItems: 'center',
        background: '#fff',
        border: '1px solid #e3e0d9',
        borderRadius: 8,
      }}>
        <Mark size={48}/>
      </div>
      <div style={{
        width: 80, height: 80,
        display: 'grid', placeItems: 'center',
        background: '#E31E2D',
        borderRadius: 8,
      }}>
        <Mark size={48} fill="#fff" secondary="#fff"/>
      </div>
    </div>

    {/* name + description */}
    <div style={{ marginTop: 'auto' }}>
      <div style={{
        fontFamily: 'var(--hand)',
        color: '#E31E2D',
        fontSize: 16,
      }}>
        Conceito {name}
      </div>
      <div style={{ fontSize: 11.5, color: '#666', marginTop: 3, lineHeight: 1.5 }}>
        {label}
      </div>
    </div>
  </div>
);

const LogoExploration = () => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    padding: 20,
    background: 'transparent',
  }}>
    <LogoCard name="A · Engrenagem" mark={MarkGear}
      label="Engrenagem com U recortado no centro. Industrial, mecânico, mais técnico."/>
    <LogoCard name="B · Chave Block" mark={MarkWrench}
      label="Chave de boca em moldura escura. Forte, compacto, alto contraste."/>
    <LogoCard name="C · Velocímetro" mark={MarkSpeed}
      label="Mostrador com ponteiro. Sugere performance e velocidade."/>
    <LogoCard name="D · Carro Abstrato" mark={MarkAbstract}
      label="Silhueta angular com faixa vermelha. Aproximação de marca clássica."/>
  </div>
);

Object.assign(window, {
  LogoExploration, MarkGear, MarkWrench, MarkSpeed, MarkAbstract, Wordmark,
});
