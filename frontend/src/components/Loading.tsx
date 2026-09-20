import { useEffect, useState } from "react";
import { BsMusicNote, BsMusicNoteBeamed } from "react-icons/bs";

const BARS = [
  { x: 69, y: 168, h: 24, delay: "0s" },
  { x: 87, y: 158, h: 44, delay: "0.15s" },
  { x: 105, y: 150, h: 60, delay: "0.3s" },
  { x: 123, y: 160, h: 40, delay: "0.45s" },
  { x: 141, y: 169, h: 22, delay: "0.6s" },
];

const NOTES = [
  { Icon: BsMusicNoteBeamed, pos: "right-0 top-8", size: "text-2xl", color: "text-[#8E82FF]", delay: "0s" },
  { Icon: BsMusicNote, pos: "left-0 top-14", size: "text-xl", color: "text-[#6C5CFF]", delay: "0.9s" },
  { Icon: BsMusicNote, pos: "right-3 top-2", size: "text-lg", color: "text-white/70", delay: "1.7s" },
];

const DEFAULT_MESSAGES = [
  "Loading your music",
  "Warming up the speakers",
  "Adjusting the headphones",
  "Finding your next favorite song",
  "Tuning the tiny music stars",
  "Making the playlist sparkle",
  "Almost ready for a little dance",
  "Turning the volume up on joy",
];

const BALLOONS = [
  { pos: "-left-20 top-8", color: "bg-[#FF8FB1]", delay: "0s" },
  { pos: "-right-20 top-16", color: "bg-[#8E82FF]", delay: "0.8s" },
  { pos: "-left-12 bottom-2", color: "bg-[#FFD166]", delay: "1.4s" },
  { pos: "-right-10 bottom-0", color: "bg-[#7DE2D1]", delay: "0.4s" },
];

const CONFETTI = [
  { pos: "left-[-3.5rem] top-4", color: "bg-[#FFD166]", rotate: "rotate-12", delay: "0s" },
  { pos: "left-[-2rem] top-28", color: "bg-[#FF8FB1]", rotate: "-rotate-12", delay: "0.5s" },
  { pos: "right-[-3rem] top-6", color: "bg-[#7DE2D1]", rotate: "rotate-45", delay: "0.9s" },
  { pos: "right-[-2rem] top-32", color: "bg-[#FFD166]", rotate: "-rotate-45", delay: "0.3s" },
  { pos: "left-2 bottom-[-1rem]", color: "bg-[#8E82FF]", rotate: "rotate-45", delay: "0.7s" },
  { pos: "right-4 bottom-[-1rem]", color: "bg-[#FF8FB1]", rotate: "-rotate-12", delay: "1.1s" },
];

const Loading = ({ messages = DEFAULT_MESSAGES }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (messages.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % messages.length), 2400);
    return () => clearInterval(id);
  }, [messages]);

  return (
    <div
      role="status"
      className="flex h-screen flex-col items-center justify-center gap-7 bg-[#17142B]"
    >
      <span className="sr-only">Loading</span>

      <style>{`
        @keyframes mc-eq {
          0%, 100% { transform: scaleY(0.45); }
          50%      { transform: scaleY(1.2); }
        }
        @keyframes mc-bob {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50%      { transform: translateY(-5px) rotate(2deg); }
        }
        @keyframes mc-float {
          0%   { transform: translateY(12px) scale(0.8); opacity: 0; }
          25%  { opacity: 1; }
          100% { transform: translateY(-44px) translateX(6px) scale(1); opacity: 0; }
        }
        @keyframes mc-shine {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes mc-dot {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%           { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes mc-swap {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes mc-celebrate {
          0%, 100% { transform: translateY(0) rotate(-3deg); }
          50% { transform: translateY(-8px) rotate(3deg); }
        }
        @keyframes mc-confetti {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.7; }
          50% { transform: translateY(-7px) rotate(20deg); opacity: 1; }
        }
        .mc-bar {
          transform-box: fill-box;
          transform-origin: center;
          animation: mc-eq 1.1s ease-in-out infinite;
        }
        .mc-cat {
          transform-box: fill-box;
          transform-origin: 50% 100%;
          animation: mc-bob 1.1s ease-in-out infinite;
        }
        .mc-note { animation: mc-float 2.6s ease-out infinite; opacity: 0; }
        .mc-shimmer {
          background: linear-gradient(90deg, #8E82FF 0%, #8E82FF 40%, #FFFFFF 50%, #8E82FF 60%, #8E82FF 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: mc-shine 2.4s linear infinite;
        }
        .mc-dot { animation: mc-dot 1.2s ease-in-out infinite; }
        .mc-swap { animation: mc-swap 0.4s ease-out; }
        .mc-balloon { animation: mc-celebrate 2.4s ease-in-out infinite; }
        .mc-confetti { animation: mc-confetti 1.8s ease-in-out infinite; }
        .mc-balloon::after {
          content: "";
          position: absolute;
          left: 50%;
          top: 100%;
          width: 1px;
          height: 28px;
          background: rgba(255, 255, 255, 0.6);
        }
        @media (prefers-reduced-motion: reduce) {
          .mc-bar, .mc-cat, .mc-shimmer, .mc-dot, .mc-swap, .mc-balloon, .mc-confetti { animation: none; }
          .mc-note { animation: none; opacity: 0.6; }
          .mc-shimmer { color: #8E82FF; background: none; }
        }
      `}</style>

      <div className="relative">
        {/* soft glow behind the scene */}
        <div className="absolute inset-4 rounded-full bg-[#6C5CFF] opacity-30 blur-3xl" />

        {/* Small celebration details keep the loader playful without changing its layout. */}
        {BALLOONS.map(({ pos, color, delay }, i) => (
          <span
            key={`balloon-${i}`}
            aria-hidden="true"
            className={`mc-balloon absolute z-10 h-9 w-7 rounded-[50%] ${pos} ${color}`}
            style={{ animationDelay: delay }}
          />
        ))}
        {CONFETTI.map(({ pos, color, rotate, delay }, i) => (
          <span
            key={`confetti-${i}`}
            aria-hidden="true"
            className={`mc-confetti absolute z-10 h-2 w-1 rounded-full ${pos} ${color} ${rotate}`}
            style={{ animationDelay: delay }}
          />
        ))}

        {/* floating music notes (react-icons) */}
        {NOTES.map(({ Icon, pos, size, color, delay }, i) => (
          <Icon
            key={i}
            aria-hidden="true"
            className={`mc-note absolute ${pos} ${size} ${color}`}
            style={{ animationDelay: delay }}
          />
        ))}

        <svg viewBox="24 30 172 200" className="relative h-44 w-auto" aria-hidden="true">
          {/* cat wearing headphones, tucked behind the cloud */}
          <g transform="translate(-5,10)">
          <g className="mc-cat">
            {/* ears */}
            <polygon points="80,68 80,38 104,56" fill="#B7AEFF" />
            <polygon points="150,68 150,38 126,56" fill="#B7AEFF" />
            <polygon points="84,62 84,46 97,56" fill="#8E82FF" />
            <polygon points="146,62 146,46 133,56" fill="#8E82FF" />
            {/* head */}
            <ellipse cx="115" cy="84" rx="36" ry="30" fill="#B7AEFF" />
            {/* face: happy closed eyes, nose, mouth, whiskers */}
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
            {/* headphones */}
            <path d="M80 84 C78 44, 152 44, 150 84" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
            <rect x="70" y="76" width="14" height="28" rx="7" fill="#6C5CFF" stroke="#FFFFFF" strokeWidth="3" />
            <rect x="146" y="76" width="14" height="28" rx="7" fill="#6C5CFF" stroke="#FFFFFF" strokeWidth="3" />
          </g>
          </g>

          {/* cloud with equalizer bars */}
          <g fill="#FFFFFF">
            <rect x="40" y="170" width="140" height="52" rx="26" />
            <circle cx="85" cy="172" r="32" />
            <circle cx="130" cy="158" r="42" />
            <circle cx="166" cy="182" r="26" />
          </g>
          <g fill="#6C5CFF">
            {BARS.map((b) => (
              <rect
                key={b.x}
                className="mc-bar"
                x={b.x}
                y={b.y}
                width="10"
                height={b.h}
                rx="5"
                style={{ animationDelay: b.delay }}
              />
            ))}
          </g>
        </svg>
      </div>

      {/* animated message + bouncing dots */}
      <div className="flex items-end gap-1.5 text-base font-medium" aria-hidden="true">
        <span key={index} className="mc-swap">
          <span className="mc-shimmer">{messages[index]}</span>
        </span>
        <span className="mb-1.5 flex gap-1">
          {[0, 0.15, 0.3].map((d) => (
            <span
              key={d}
              className="mc-dot h-1.5 w-1.5 rounded-full bg-[#8E82FF]"
              style={{ animationDelay: `${d}s` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
};

export default Loading;