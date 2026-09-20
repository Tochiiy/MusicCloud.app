import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiLock, FiLogIn, FiMail } from "react-icons/fi";
import { useUserData } from "../context/userContext";
import Logo from "../components/Logo";
import toast from "react-hot-toast";
import { loginUserSchema } from "../validators/userValidator";

const inputClass =
  "w-full rounded-full border border-white/10 bg-[#17142B] px-5 py-3 text-sm text-white " +
  "placeholder:text-white/40 outline-none transition " +
  "focus:border-[#6C5CFF] focus:ring-2 focus:ring-[#6C5CFF]/40";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const { loginUser, btnLoading } = useUserData();

  async function submitHandler(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const result = loginUserSchema.safeParse({ email, password });
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? "Check your details");
      return;
    }

    loginUser(result.data.email, result.data.password, navigate);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#17142B] p-4">
      <div className="relative w-full max-w-md">
        {/* soft glow behind the card */}
        <div className="absolute -top-10 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-[#6C5CFF] opacity-30 blur-3xl" />

        <div className="relative rounded-3xl border border-white/10 bg-[#1E1A38] p-8 shadow-2xl">
          <div className="flex justify-center">
            <Logo />
          </div>

          <h2 className="mt-4 text-center text-2xl font-semibold text-white">
            Welcome back to MusicCloud
          </h2>
          <p className="mt-1 text-center text-sm text-white/60">
            Log in to keep the music playing.
          </p>

          <form className="mt-8" onSubmit={submitHandler}>
            <div className="mb-4">
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-white/80">
                Email <span className="text-red-400" aria-hidden="true">*</span><span className="sr-only"> required</span>
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`${inputClass} pl-12`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-white/80">
                Password <span className="text-red-400" aria-hidden="true">*</span><span className="sr-only"> required</span>
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className={`${inputClass} pl-12 pr-12`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 transition hover:text-white"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={btnLoading}
              className="w-full rounded-full bg-[#6C5CFF] py-3 text-sm font-semibold text-white transition
                         hover:bg-[#8E82FF] focus-visible:outline-none focus-visible:ring-2
                         focus-visible:ring-[#8E82FF] focus-visible:ring-offset-2
                         focus-visible:ring-offset-[#1E1A38] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {btnLoading ? "Logging in..." : "Log in"}
              {!btnLoading && <FiLogIn className="inline ml-2" />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/60">
            New to MusicCloud?{" "}
            <Link
              to="/register"
              className="font-medium text-[#8E82FF] transition hover:text-white"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;