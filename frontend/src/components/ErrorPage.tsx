import { Link, useNavigate } from "react-router-dom";

export type CatFace = "confused" | "surprised" | "dizzy";

type ErrorPageProps = {
  code: string;
  title: string;
  message: string;
  face: CatFace;
  /** Optional replacement for the default "Go back" button */
  secondary?: { label: string; onClick: () => void };
};

const Face = ({ face }: { face: CatFace }) => {
  if (face === "dizzy") {
    return (
      <g fill="none" stroke="#17142B" strokeWidth="3" strokeLinecap="round">
        <path d="M99 80 l8 8 M107 80 l-8 8" />
        <path d="M123 80 l8 8 M131 80 l-8 8" />
        <path d="M109 102 h12" strokeWidth="2" />
      </g>
    );
  }
  if (face === "surprised") {
    return (
      <g fill="#17142B">
        <circle cx="103" cy="84" r="5.5" />
        <circle cx="127" cy="84" r="5.5" />
        <circle cx="104.8" cy="82.2" r="1.6" fill="#FFFFFF" />
        <circle cx="128.8" cy="82.2" r="1.6" fill="#FFFFFF" />
        <ellipse cx="115" cy="102" rx="3" ry="4" />
      </g>
    );
  }
  return (
    <g fill="#17142B">
      <circle cx="103" cy="84" r="4.5" />
      <circle cx="127" cy="84" r="4.5" />
      <path
        d="M108 101 q3.5 -3 7 0 t7 0"
        fill="none"
        stroke="#17142B"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </g>
  );
};

const tilt: Record<CatFace, number> = { confused: -6, surprised: 0, dizzy: 6 };

const Cat = ({ face }: { face: CatFace }) => (
  <svg viewBox="24 30 172 200" className="relative h-32 w-auto" aria-hidden="true">
    <g transform={`translate(-5,10) rotate(${tilt[face]} 115 110)`}>
      <polygon points="80,68 80,38 104,56" fill="#B7AEFF" />
      <polygon points="150,68 150,38 126,56" fill="#B7AEFF" />
      <polygon points="84,62 84,46 97,56" fill="#8E82FF" />
      <polygon points="146,62 146,46 133,56" fill="#8E82FF" />
      <ellipse cx="115" cy="84" rx="36" ry="30" fill="#B7AEFF" />
      <Face face={face} />
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
    <g fill="#FFFFFF">
      <rect x="40" y="170" width="140" height="52" rx="26" />
      <circle cx="85" cy="172" r="32" />
      <circle cx="130" cy="158" r="42" />
      <circle cx="166" cy="182" r="26" />
    </g>
    <g fill="#6C5CFF">
      <rect x="69" y="168" width="10" height="24" rx="5" />
      <rect x="87" y="158" width="10" height="44" rx="5" />
      <rect x="105" y="150" width="10" height="60" rx="5" />
      <rect x="123" y="160" width="10" height="40" rx="5" />
      <rect x="141" y="169" width="10" height="22" rx="5" />
    </g>
  </svg>
);

const ErrorPage = ({ code, title, message, face, secondary }: ErrorPageProps) => {
  const navigate = useNavigate();
  const second = secondary ?? { label: "Go back", onClick: () => navigate(-1) };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#17142B] p-4">
      <main className="relative flex w-full max-w-lg flex-col items-center text-center">
        {/* soft glow behind the cat */}
        <div className="absolute -top-6 h-40 w-40 rounded-full bg-[#6C5CFF] opacity-30 blur-3xl" />

        <Cat face={face} />

        <p className="mt-6 text-7xl font-bold tracking-tight text-[#8E82FF]">{code}</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">{title}</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-white/60">{message}</p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="rounded-full bg-[#6C5CFF] px-6 py-3 text-sm font-semibold text-white transition
                       hover:bg-[#8E82FF] focus-visible:outline-none focus-visible:ring-2
                       focus-visible:ring-[#8E82FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#17142B]"
          >
            Go home
          </Link>
          <button
            type="button"
            onClick={second.onClick}
            className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition
                       hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2
                       focus-visible:ring-[#8E82FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#17142B]"
          >
            {second.label}
          </button>
        </div>
      </main>
    </div>
  );
};

export default ErrorPage;