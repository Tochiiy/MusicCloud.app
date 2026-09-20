import { NavLink } from "react-router-dom";
import { FiArrowLeft, FiGrid, FiUsers } from "react-icons/fi";

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
    isActive
      ? "bg-[#6C5CFF] text-white shadow-lg shadow-[#6C5CFF]/30"
      : "border border-white/10 text-white hover:bg-white/10"
  }`;

const AdminNav = () => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <NavLink to="/admin/dashboard" className={tabClass} end>
        <FiGrid />
        Add Content
      </NavLink>
      <NavLink to="/admin/users" className={tabClass}>
        <FiUsers />
        Registered Users
      </NavLink>
      <NavLink
        to="/"
        className="flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
      >
        <FiArrowLeft className="text-[#8E82FF]" />
        Back to app
      </NavLink>
    </div>
  );
};

export default AdminNav;