import { NavLink } from "react-router-dom";
import { FiHome, FiList, FiShield, FiSearch } from "react-icons/fi";
import { FaHeart } from "react-icons/fa6";
import { useUserData } from "../context/userContext";

const MobileNavItem = ({ isActive }: { isActive: boolean }) =>
  `flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-semibold transition ${
    isActive ? "text-[#8E82FF]" : "text-[var(--mc-frame-muted)]"
  }`;

const MobileNav = () => {
  const { user } = useUserData();

  return (
    <nav
      className="flex shrink-0 items-stretch border-t border-[#2E2A55] bg-[var(--mc-frame-bg)] lg:hidden"
      aria-label="Mobile navigation"
    >
      <NavLink to="/" end className={MobileNavItem}>
        <FiHome size={22} />
        Home
      </NavLink>
      <NavLink to="/search" className={MobileNavItem}>
        <FiSearch size={22} />
        Search
      </NavLink>
      <NavLink to="/playlist" className={MobileNavItem}>
        <FiList size={22} />
        PlayList
      </NavLink>
      <NavLink to="/liked" className={MobileNavItem}>
        <FaHeart size={22} />
        Liked
      </NavLink>
      {user?.role === "admin" && (
        <NavLink to="/admin/dashboard" className={MobileNavItem}>
          <FiShield size={22} />
          Admin
        </NavLink>
      )}
    </nav>
  );
};

export default MobileNav;