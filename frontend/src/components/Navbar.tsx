import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useUserData } from "../context/userContext";
import { useTheme } from "./themeContext";
import Logo from "./Logo";

const CHIP_BASE = "rounded-2xl py-1 px-4 text-[20px] cursor-pointer transition";

const Navbar = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { logoutUser } = useUserData();
  const [filter, setFilter] = useState("All");

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login", { replace: true });
  };

  const handleChip = (label: string) => {
    setFilter(label);
    if (label === "PlayList") navigate("/playlist");
  };

  const chipIsActive = (label: string) =>
    filter === label
      ? "bg-[var(--mc-chip-active-bg)] text-[var(--mc-chip-active-text)]"
      : "bg-[var(--mc-pill-bg)] text-[var(--mc-pill-text)] border border-[var(--mc-pill-border)]";

  const pill = (label: string) => handleChip(label);

  return <>
  
  <div className="w-full flex justify-between items-center font-semi-bold">
    <div className="flex items-center gap-2">
      <button type="button" aria-label="Go to MusicCloud home" className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
        <Logo className="h-9 w-auto" tile={theme === "light"} />
        <span className="hidden text-xl font-bold text-[var(--mc-text)] md:block">MusicCloud</span>
      </button>
      <button type="button" title="Go back" aria-label="Go back" className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--mc-icon)] transition hover:bg-[var(--mc-hover)]" onClick={() => navigate(-1)}>
        <FiChevronLeft size={20} />
      </button>
      <button type="button" title="Go forward" aria-label="Go forward" className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--mc-icon)] transition hover:bg-[var(--mc-hover)]" onClick={() => navigate(1)}>
        <FiChevronRight size={20} />
      </button>
    </div>

    <div className="flex items-center gap-4">
      <p className="px-4 py-1 cursor-pointer bg-[var(--mc-pill-bg)] text-[var(--mc-pill-text)] border border-[var(--mc-pill-border)] rounded-full text-[20px] mt-4 md:block hidden " onClick={() => navigate("/coming-soon")}>Explore Premium</p>
      <p className="px-4 py-1 cursor-pointer bg-[var(--mc-pill-bg)] text-[var(--mc-pill-text)] border border-[var(--mc-pill-border)] rounded-full text-[20px] mt-4 md:block hidden " onClick={() => navigate("/coming-soon")}>Install App</p>
      <p className="px-4 py-1 cursor-pointer bg-[var(--mc-pill-bg)] text-[var(--mc-pill-text)] border border-[var(--mc-pill-border)] rounded-full text-[20px] mt-4 md:block" onClick={handleLogout}>LogOut</p>
   </div>
  </div>
  
    <div className="flex items-center gap-4 mt-4">
      <p className={`${CHIP_BASE} ${chipIsActive("All")} md:block`} onClick={() => pill("All")}>All</p>
      <p className={`${CHIP_BASE} ${chipIsActive("Music")} hidden md:block`} onClick={() => pill("Music")}>Music</p>
      <p className={`${CHIP_BASE} ${chipIsActive("Podcasts")} hidden md:block`} onClick={() => pill("Podcasts")}>Podcasts</p>
      <p className={`${CHIP_BASE} ${chipIsActive("PlayList")} md:block`} onClick={() => pill("PlayList")}>PlayList</p>
  </div>
  
  </>

}

export default Navbar