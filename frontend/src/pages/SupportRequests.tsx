import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiMail, FiRefreshCw, FiUploadCloud } from "react-icons/fi";

const ADMIN_EMAIL = "tochukwusun24@gmail.com";

type RequestKind = "password" | "song";

const SupportRequests = () => {
  const [kind, setKind] = useState<RequestKind>("password");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState("");

  const submitRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const subject = kind === "password" ? "MusicCloud password reset request" : "MusicCloud song posting request";
    const body = kind === "password"
      ? `Hello,\n\nI need help resetting my MusicCloud password.\n\nName: ${name}\nAccount email: ${email}\n\nDetails:\n${details}`
      : `Hello,\n\nI would like to request a song to be posted on MusicCloud.\n\nName: ${name}\nContact email: ${email}\n\nSong details:\n${details}`;

    window.location.href = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <main className="min-h-screen bg-[#0d0c18] px-5 py-6 text-white sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link to="/welcome" className="mb-10 inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white">
          <FiArrowLeft /> Back to MusicCloud
        </Link>

        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#B7AEFF]">Need a hand?</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">Send a request.</h1>
            <p className="mt-5 leading-7 text-white/60">
              Choose a request type and your email app will prepare a message for the MusicCloud administrator.
            </p>
            <div className="mt-8 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
              <FiMail className="mt-0.5 shrink-0 text-[#B7AEFF]" />
              <span>Requests are addressed to <strong className="text-white">{ADMIN_EMAIL}</strong>. No password is collected here.</span>
            </div>
          </div>

          <form onSubmit={submitRequest} className="rounded-3xl border border-white/10 bg-[#19172a] p-6 shadow-2xl sm:p-8">
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-black/20 p-1">
              <button type="button" onClick={() => setKind("password")} className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${kind === "password" ? "bg-[#8E82FF] text-[#0d0c18]" : "text-white/60 hover:text-white"}`}>
                <FiRefreshCw /> Reset password
              </button>
              <button type="button" onClick={() => setKind("song")} className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${kind === "song" ? "bg-[#8E82FF] text-[#0d0c18]" : "text-white/60 hover:text-white"}`}>
                <FiUploadCloud /> Post a song
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              <label className="grid gap-2 text-sm font-semibold text-white/80">
                Your name
                <input required value={name} onChange={(event) => setName(event.target.value)} className="rounded-2xl border border-white/10 bg-[#0d0c18] px-4 py-3 font-normal text-white outline-none focus:border-[#8E82FF]" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-white/80">
                Contact email
                <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="rounded-2xl border border-white/10 bg-[#0d0c18] px-4 py-3 font-normal text-white outline-none focus:border-[#8E82FF]" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-white/80">
                {kind === "password" ? "What do you need help with?" : "Song title, artist, link, and any details"}
                <textarea required value={details} onChange={(event) => setDetails(event.target.value)} rows={5} className="resize-y rounded-2xl border border-white/10 bg-[#0d0c18] px-4 py-3 font-normal text-white outline-none focus:border-[#8E82FF]" />
              </label>
              <button type="submit" className="mt-2 rounded-full bg-[#8E82FF] px-5 py-3.5 text-sm font-bold text-[#0d0c18] transition hover:bg-[#B7AEFF]">
                Prepare email request
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default SupportRequests;
