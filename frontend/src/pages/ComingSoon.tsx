import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import { FiArrowLeft } from "react-icons/fi";

const COLORS = ["#6C5CFF", "#8E82FF", "#FF8FB1", "#EFECFF", "#5CE1C6"];
const SKIN = "#FFC9A9";

const Dancer = ({
  color,
  delay,
  phase = 0,
}: {
  color: string;
  delay: number;
  phase?: number;
}) => (
  <motion.div
    className="relative h-48 w-24"
    animate={{ y: [0, -14, 0] }}
    transition={{ duration: 0.55 + phase * 0.1, repeat: Infinity, ease: "easeInOut", delay }}
  >
    <motion.div
      className="absolute left-1/2 top-0 origin-bottom -translate-x-1/2"
      animate={{ rotate: [-10, 10, -10] }}
      transition={{ duration: 0.8 + phase * 0.1, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <div className="h-0 w-0 border-b-[20px] border-l-[12px] border-r-[12px] border-b-[#FF8FB1] border-l-transparent border-r-transparent" />
    </motion.div>

    <motion.div
      className="absolute left-1/2 top-6 h-10 w-10 origin-bottom -translate-x-1/2 rounded-full"
      style={{ backgroundColor: SKIN }}
      animate={{ rotate: [-7, 7, -7] }}
      transition={{ duration: 0.65 + phase * 0.1, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <div className="absolute left-1/2 top-6 h-1.5 w-4 -translate-x-1/2 rounded-full bg-black/70" />
    </motion.div>

    <motion.div
      className="absolute left-1/2 top-[76px] h-14 w-16 origin-top -translate-x-1/2 rounded-t-[40px] rounded-b-xl"
      style={{ backgroundColor: color }}
      animate={{ rotate: [-4, 4, -4] }}
      transition={{ duration: 0.6 + phase * 0.1, repeat: Infinity, ease: "easeInOut", delay }}
    />

    <motion.div
      className="absolute left-1/2 top-[64px] origin-top -translate-x-1/2"
      animate={{ rotate: [-26, 26, -26] }}
      transition={{ duration: 0.45 + phase * 0.1, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <div
        className="absolute h-11 w-2.5 origin-top rounded-full"
        style={{ backgroundColor: color, transform: "rotate(34deg) translateX(6px)" }}
      />
      <div
        className="absolute h-11 w-2.5 origin-top rounded-full"
        style={{ backgroundColor: color, transform: "rotate(-34deg) translateX(-6px)" }}
      />
    </motion.div>

    <motion.div
      className="absolute left-1/2 top-[142px] origin-top -translate-x-1/2"
      animate={{ rotate: [7, -7, 7] }}
      transition={{ duration: 0.9 + phase * 0.1, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <div
        className="absolute h-12 w-2.5 origin-top rounded-full bg-[#2E2A5C]"
        style={{ transform: "rotate(12deg) translateX(8px)" }}
      />
      <div
        className="absolute h-12 w-2.5 origin-top rounded-full bg-[#2E2A5C]"
        style={{ transform: "rotate(-12deg) translateX(-8px)" }}
      />
    </motion.div>
  </motion.div>
);

const pseudoRandom = (n: number, i: number) => {
  const x = Math.sin((i + 1) * 127.1 + n * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const Confetti = ({ children }: { children?: React.ReactNode }) => {
  const pieces = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, i) => ({
        id: i,
        left: pseudoRandom(1, i) * 100,
        delay: pseudoRandom(2, i) * 2.5,
        duration: 2.2 + pseudoRandom(3, i) * 2,
        rotate: (pseudoRandom(4, i) - 0.5) * 540,
        color: COLORS[i % COLORS.length],
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute top-0 h-3 w-2 rounded-sm"
          style={{ left: `${p.left}%`, backgroundColor: p.color }}
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 560, opacity: [0, 1, 1, 0], rotate: p.rotate }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            repeatDelay: 1.2,
            ease: "linear",
          }}
        />
      ))}
      {children}
    </div>
  );
};

const DiscoBall = () => (
  <div className="relative flex flex-col items-center">
    <div className="h-10 w-0.5 bg-white/30" />
    <motion.div
      className="relative h-16 w-16 overflow-hidden rounded-full"
      style={{
        background: "repeating-conic-gradient(#FFFFFF 0deg 18deg, #B7AEFF 18deg 36deg)",
        boxShadow: "0 0 40px rgba(140, 130, 255, 0.55)",
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/60 via-transparent to-black/40" />
    </motion.div>
    <div
      className="h-32 w-56"
      style={{
        background: "linear-gradient(to top, rgba(142,130,255,0.28), transparent)",
        clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
      }}
    />
  </div>
);

const ComingSoon = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-4">
        <Confetti />

        <motion.h1
          className="text-center text-4xl font-bold tracking-tight text-white md:text-6xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Almost there —{" "}
          <span className="bg-gradient-to-r from-[#6C5CFF] to-[#FF8FB1] bg-clip-text text-transparent">
            Coming Soon
          </span>
        </motion.h1>

        <motion.p
          className="mt-4 max-w-xl text-center text-white/60"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          MusicCloud Premium and the mobile app are on the way. Get ready to
          dance — the party starts right here.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <DiscoBall />
        </motion.div>

        <div className="mt-6 flex items-end justify-center gap-10">
          <Dancer color={COLORS[0]} delay={0} phase={0} />
          <Dancer color={COLORS[2]} delay={0.2} phase={1} />
          <Dancer color={COLORS[3]} delay={0.4} phase={2} />
        </div>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="mt-12 flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          <FiArrowLeft className="text-[#8E82FF]" />
          Back to the music
        </button>
      </div>
    </Layout>
  );
};

export default ComingSoon;