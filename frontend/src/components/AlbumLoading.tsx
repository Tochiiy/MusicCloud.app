import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BsMusicNote, BsMusicNoteBeamed } from "react-icons/bs";

interface DancerColors {
  body: string;
  dark: string;
  head: string;
  blush: string;
}

const DANCERS: { colors: DancerColors; delay: number }[] = [
  {
    colors: { body: "#8E82FF", dark: "#6C5CFF", head: "#B7AEFF", blush: "#FF8FB1" },
    delay: 0,
  },
  {
    colors: { body: "#FF8FB1", dark: "#F472A0", head: "#FFC2D8", blush: "#FFD166" },
    delay: -0.3,
  },
  {
    colors: { body: "#7DE2D1", dark: "#3FBFAC", head: "#A9F0E6", blush: "#FFD166" },
    delay: -0.15,
  },
];

const NOTES = [
  { Icon: BsMusicNoteBeamed, pos: "right-2 top-10", size: "text-2xl", color: "text-[#8E82FF]", delay: 0 },
  { Icon: BsMusicNote, pos: "left-0 top-1", size: "text-xl", color: "text-[#FF8FB1]", delay: 0.8 },
  { Icon: BsMusicNote, pos: "right-0 top-24", size: "text-lg", color: "text-white/70", delay: 1.6 },
  { Icon: BsMusicNoteBeamed, pos: "left-2 top-24", size: "text-lg", color: "text-[#7DE2D1]", delay: 1.2 },
];

const MESSAGES = [
  "Loading album tracks",
  "Putting on the dancing shoes",
  "Turning up the playlist",
  "Setting the vibe",
  "Teaching the bassline the moves",
  "Almost ready to groove",
];

const SWING = { duration: 0.9, ease: "easeInOut" as const, repeat: Infinity };

const Dancer = ({
  colors,
  delay,
  enabled,
}: {
  colors: DancerColors;
  delay: number;
  enabled: boolean;
}) => {
  const figure = (keyframes: number[], y?: number[]) => ({
    animate: enabled ? (y ? { rotate: keyframes, y } : { rotate: keyframes }) : {},
    transition: { ...SWING, delay },
  });

  return (
    <motion.svg
      viewBox="0 0 100 150"
      aria-hidden="true"
      className="h-40 w-24"
      initial={{ scale: 0, opacity: 0 }}
      animate={enabled ? { scale: 1, opacity: 1 } : { scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
    >
      <motion.g style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}>
        <motion.g {...figure([-4, 4], [0, -6, 0])}>
          {/* legs */}
          <motion.g
            style={{ transformBox: "fill-box", transformOrigin: "50% 0%" }}
            {...figure([14, -14])}
          >
            <path d="M46 74 L38 116" fill="none" stroke={colors.dark} strokeWidth="10" strokeLinecap="round" />
            <ellipse cx="37" cy="118" rx="8" ry="5" fill={colors.dark} />
          </motion.g>
          <motion.g
            style={{ transformBox: "fill-box", transformOrigin: "50% 0%" }}
            {...figure([-14, 14])}
          >
            <path d="M54 74 L62 116" fill="none" stroke={colors.dark} strokeWidth="10" strokeLinecap="round" />
            <ellipse cx="63" cy="118" rx="8" ry="5" fill={colors.dark} />
          </motion.g>

          {/* arms */}
          <motion.g style={{ transformBox: "fill-box", transformOrigin: "50% 0%" }} {...figure([45, -15])}>
            <path d="M44 46 L25 76" fill="none" stroke={colors.dark} strokeWidth="9" strokeLinecap="round" />
          </motion.g>
          <motion.g style={{ transformBox: "fill-box", transformOrigin: "50% 0%" }} {...figure([-15, 45])}>
            <path d="M56 46 L75 76" fill="none" stroke={colors.dark} strokeWidth="9" strokeLinecap="round" />
          </motion.g>

          {/* body */}
          <rect x="41" y="40" width="18" height="36" rx="8" fill={colors.body} />

          {/* head */}
          <motion.g style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }} {...figure([0, 0], [0, -2, 0])}>
            <circle cx="50" cy="24" r="13" fill={colors.head} />
            <ellipse cx="43" cy="25" rx="4" ry="2.5" fill={colors.blush} opacity="0.7" />
            <ellipse cx="57" cy="25" rx="4" ry="2.5" fill={colors.blush} opacity="0.7" />
            <g fill="none" stroke="#17142B" strokeWidth="2" strokeLinecap="round">
              <path d="M45 22 q2 -2.5 4 0" />
              <path d="M51 22 q2 -2.5 4 0" />
              <path d="M50 28 q-2 2.5 -4.5 1.5" strokeWidth="1.6" />
              <path d="M50 28 q2 2.5 4.5 1.5" strokeWidth="1.6" />
            </g>
          </motion.g>
        </motion.g>
      </motion.g>
    </motion.svg>
  );
};

const AlbumLoading = () => {
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();
  const enabled = !reduced;

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % MESSAGES.length), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      role="status"
      className="flex min-h-screen flex-col items-center justify-center gap-10 bg-[#17142B]"
    >
      <span className="sr-only">Loading album playlist</span>

      <style>{`
        .al-shimmer {
          background: linear-gradient(90deg, #8E82FF 0%, #8E82FF 40%, #FFFFFF 50%, #8E82FF 60%, #8E82FF 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
      `}</style>

      {/* vinyl spinner */}
      <div className="relative">
        <div className="absolute inset-6 rounded-full bg-[#6C5CFF] opacity-25 blur-3xl" />

        {NOTES.map(({ Icon, pos, size, color, delay }, i) => (
          <motion.div
            key={i}
            className={`absolute ${pos} ${size} ${color}`}
            aria-hidden="true"
            animate={enabled ? { y: [16, -64], opacity: [0, 1, 1, 0], scale: [0.7, 1.05, 1.05, 0.9] } : {}}
            transition={{ duration: 2.6, ease: "easeOut", repeat: Infinity, delay }}
          >
            <Icon />
          </motion.div>
        ))}

        <motion.div
          className="relative h-36 w-36"
          animate={enabled ? { rotate: [0, -2, 2, 0] } : {}}
          transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity }}
        >
          <motion.svg
            viewBox="0 0 120 120"
            className="h-full w-full"
            animate={enabled ? { rotate: 360 } : {}}
            transition={{ duration: 2.8, ease: "linear", repeat: Infinity }}
          >
            <circle cx="60" cy="60" r="56" fill="#0D0B1F" stroke="#3A2F6B" strokeWidth="3" />
            <g fill="none" stroke="#8E82FF" strokeWidth="3" opacity="0.85">
              <circle cx="60" cy="60" r="46" />
              <circle cx="60" cy="60" r="36" />
              <circle cx="60" cy="60" r="27" opacity="0.5" />
            </g>
            <circle cx="60" cy="60" r="18" fill="#8E82FF" />
            <circle cx="60" cy="60" r="5" fill="#17142B" />
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <circle
                key={angle}
                cx={60 + 27.4 * Math.sin((angle * Math.PI) / 180)}
                cy={60 - 27.4 * Math.cos((angle * Math.PI) / 180)}
                r="2.4"
                fill="#FFFFFF"
                opacity="0.85"
              />
            ))}
          </motion.svg>

          {/* centre label */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={enabled ? { y: [6, -6, 6] } : {}}
              transition={{ duration: 0.8, ease: "easeInOut", repeat: Infinity }}
            >
              <BsMusicNoteBeamed className="text-2xl text-[#17142B]" aria-hidden="true" />
            </motion.div>
          </div>

          {/* record-arm / needle */}
          <motion.svg
            viewBox="-20 0 60 70"
            className="absolute -top-2 -right-8 h-16 w-9"
            animate={enabled ? { rotate: [0, 3, -3, 0] } : {}}
            transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity }}
            style={{ transformBox: "fill-box", transformOrigin: "50% 0%" }}
          >
            <line x1="-8" y1="6" x2="34" y2="58" stroke="#F9FAFB" strokeWidth="3" strokeLinecap="round" />
            <circle cx="-8" cy="8" r="5" fill="#FFD166" />
          </motion.svg>
        </motion.div>
      </div>

      {/* dancing crowd */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 24 }}
        animate={enabled ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
      >
        <div className="flex items-end gap-6">
          <div className="h-14 w-16" aria-hidden="true" />
          {DANCERS.map((d, i) => (
            <Dancer key={i} {...d} enabled={enabled} />
          ))}
          <div className="h-14 w-16" aria-hidden="true" />
        </div>

        {/* stage */}
        <div
          className="al-stage absolute -inset-x-10 bottom-0 h-16 rounded-[100%] blur-sm"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(142,130,255,0.18) 55%, rgba(142,130,255,0.32) 100%)",
          }}
          aria-hidden="true"
        />
        <motion.div
          className="absolute -inset-x-8 bottom-0 h-2 rounded-[100%] bg-[#8E82FF]"
          animate={enabled ? { opacity: [0.35, 0.8, 0.35] } : {}}
          transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity }}
          aria-hidden="true"
        />
      </motion.div>

      {/* animated message + bouncing dots */}
      <div className="flex items-end gap-1.5 text-base font-medium" aria-hidden="true">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <span className="al-shimmer">{MESSAGES[index]}</span>
          </motion.span>
        </AnimatePresence>
        <span className="mb-1.5 flex gap-1">
          {[0, 0.15, 0.3].map((d) => (
            <motion.span
              key={d}
              className="h-1.5 w-1.5 rounded-full bg-[#8E82FF]"
              animate={enabled ? { y: [0, -5, 0], opacity: [0.35, 1, 0.35] } : {}}
              transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity, delay: d }}
            />
          ))}
        </span>
      </div>
    </div>
  );
};

export default AlbumLoading;