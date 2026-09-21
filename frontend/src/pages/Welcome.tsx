import { Link } from "react-router-dom";
import { FiArrowRight, FiHeadphones, FiPlay, FiRadio } from "react-icons/fi";
import { FaWaveSquare } from "react-icons/fa6";

const FEATURED_IMAGE = "/PublicRouteImages.jpg";
const SECONDARY_IMAGE = "/PublicRouteImages.jpg";
const FALLBACK_IMAGE = "/download.jpeg";

const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  const image = event.currentTarget;
  if (image.src.endsWith(FALLBACK_IMAGE)) return;
  image.src = FALLBACK_IMAGE;
};

const Welcome = () => {
  return (
    <main className="min-h-screen overflow-hidden bg-[#0d0c18] text-white">
      <section className="relative mx-auto flex min-h-screen max-w-[1600px] flex-col px-5 py-5 sm:px-8 lg:px-12">
        <header className="relative z-20 flex items-center justify-between">
          <Link to="/welcome" className="flex items-center gap-3" aria-label="MusicCloud home">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#8E82FF] text-[#0d0c18] shadow-[0_0_30px_rgba(142,130,255,0.35)]">
              <FaWaveSquare size={22} />
            </span>
            <span className="text-lg font-bold tracking-tight">MusicCloud</span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4" aria-label="Public navigation">
            <Link
              to="/login"
              className="rounded-full px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#17142B] transition hover:bg-[#d9d4ff]"
            >
              Join free
            </Link>
          </nav>
        </header>

        <div className="relative z-10 grid flex-1 items-center gap-10 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-16">
          <div className="max-w-xl">
            <p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-[#B7AEFF]">
              <FiRadio /> Your sound, in motion
            </p>
            <h1 className="max-w-2xl text-5xl font-semibold leading-[0.98] tracking-[-0.04em] sm:text-7xl lg:text-8xl">
              Find the music that feels like <span className="text-[#B7AEFF]">you.</span>
            </h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-white/60 sm:text-lg">
              Keep your favorite songs close, discover albums worth replaying, and let every listen become part of your day.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                to="/register"
                className="group flex items-center gap-3 rounded-full bg-[#8E82FF] px-6 py-3.5 text-sm font-bold text-[#0d0c18] transition hover:bg-[#b7aeff]"
              >
                Start listening
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            <Link to="/requests" className="mt-5 inline-flex text-sm text-white/50 underline-offset-4 transition hover:text-white hover:underline">
              Make a request or song post
            </Link>
              <Link
                to="/login"
                className="rounded-full border border-white/15 px-6 py-3.5 text-sm font-bold text-white transition hover:border-white/40 hover:bg-white/5"
              >
                I have an account
              </Link>
            </div>
            <div className="mt-12 flex gap-8 border-t border-white/10 pt-5 text-sm text-white/50">
              <span><strong className="block text-xl text-white">∞</strong>songs to explore</span>
              <span><strong className="block text-xl text-white">1</strong>place for your taste</span>
            </div>
          </div>

          <div className="relative min-h-[430px] sm:min-h-[560px]">
            <div className="absolute inset-0 rounded-[2rem] bg-[#8E82FF]/10 blur-3xl" />
            <div className="absolute right-0 top-0 h-[78%] w-[82%] overflow-hidden rounded-[2rem] border border-white/15 shadow-2xl shadow-black/50">
              <img
                src={FEATURED_IMAGE}
                alt="Musician performing with headphones and a microphone"
                className="h-full w-full object-cover"
                onError={handleImageError}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0c18]/85 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/60">Now playing</p>
                  <p className="mt-1 text-xl font-semibold">Midnight Frequencies</p>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#17142B]"><FiPlay fill="currentColor" /></span>
              </div>
            </div>
            <div className="absolute bottom-2 left-0 w-[48%] overflow-hidden rounded-[1.5rem] border-8 border-[#0d0c18] shadow-xl sm:bottom-8 sm:w-[42%]">
              <img
                src={SECONDARY_IMAGE}
                alt="Crowd enjoying live music"
                className="aspect-[4/5] w-full object-cover"
                onError={handleImageError}
              />
            </div>
            <div className="absolute bottom-8 right-2 flex items-center gap-3 rounded-2xl border border-white/15 bg-[#19172a]/90 px-4 py-3 backdrop-blur sm:right-8">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FF8FB1]/20 text-[#FFB1C7]"><FiHeadphones /></span>
              <div>
                <p className="text-xs text-white/50">Your library</p>
                <p className="text-sm font-semibold">Made for repeat</p>
              </div>
            </div>
          </div>
        </div>

        <footer className="relative z-10 flex items-center justify-between border-t border-white/10 py-5 text-xs text-white/40">
          <span>Music for every version of you.</span>
          <span>Listen beautifully.</span>
        </footer>
      </section>
    </main>
  );
};

export default Welcome;
