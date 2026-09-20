interface LogoProps {
  className?: string
  tile?: boolean
}

const Logo = ({ className = "relative h-28 w-auto", tile = false }: LogoProps) => (
  <svg viewBox="24 30 172 200" className={className} aria-hidden="true">
    {/* cat with headphones, tucked behind the cloud */}
    <g transform="translate(-5,10)">
      <polygon points="80,68 80,38 104,56" fill="#B7AEFF" />
      <polygon points="150,68 150,38 126,56" fill="#B7AEFF" />
      <polygon points="84,62 84,46 97,56" fill="#8E82FF" />
      <polygon points="146,62 146,46 133,56" fill="#8E82FF" />
      <ellipse cx="115" cy="84" rx="36" ry="30" fill="#B7AEFF" />
      <g fill="none" stroke="#17142B" strokeWidth="3" strokeLinecap="round">
        <path d="M98 84 q5 -6 10 0" />
        <path d="M122 84 q5 -6 10 0" />
        <path d="M115 96 q-4 5 -8 2" strokeWidth="2" />
        <path d="M115 96 q4 5 8 2" strokeWidth="2" />
      </g>
      <polygon points="111,91 119,91 115,96" fill="#FF8FB1" />
      <g stroke="#17142B" strokeWidth="1.5" strokeLinecap="round" opacity="0.6">
        <line x1="92" y1="94" x2="80" y2="92" />
        <line x1="92" y1="98" x2="81" y2="101" />
        <line x1="138" y1="94" x2="150" y2="92" />
        <line x1="138" y1="98" x2="149" y2="101" />
      </g>
      <path d="M80 84 C78 44, 152 44, 150 84" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      <rect x="70" y="76" width="14" height="28" rx="7" fill="#6C5CFF" stroke="#FFFFFF" strokeWidth="3" />
      <rect x="146" y="76" width="14" height="28" rx="7" fill="#6C5CFF" stroke="#FFFFFF" strokeWidth="3" />
    </g>
    {/* cloud with equalizer bars */}
    <g fill={tile ? "#6C5CFF" : "#FFFFFF"}>
      <rect x="40" y="170" width="140" height="52" rx="26" />
      <circle cx="85" cy="172" r="32" />
      <circle cx="130" cy="158" r="42" />
      <circle cx="166" cy="182" r="26" />
    </g>
    <g fill={tile ? "#EFECFF" : "#6C5CFF"}>
      <rect x="69" y="168" width="10" height="24" rx="5" />
      <rect x="87" y="158" width="10" height="44" rx="5" />
      <rect x="105" y="150" width="10" height="60" rx="5" />
      <rect x="123" y="160" width="10" height="40" rx="5" />
      <rect x="141" y="169" width="10" height="22" rx="5" />
    </g>
  </svg>
)

export default Logo