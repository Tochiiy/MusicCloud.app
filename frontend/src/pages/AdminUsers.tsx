import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiUsers } from "react-icons/fi";
import toast from "react-hot-toast";
import AdminNav from "../components/AdminNav";
import { useUserData } from "../context/userContext";

interface AdminUser {
  _id: string;
  name?: string;
  username?: string;
  email?: string;
  role?: string;
  createdAt?: string;
}

const cardClass = "rounded-3xl border border-white/10 bg-[#1E1A38] p-6 shadow-2xl";

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)
      ?.message;
    return message || fallback;
  }
  return fallback;
}

const server =
  import.meta.env.VITE_ADMIN_SERVER_URL || "http://13.235.70.183:7000";

const AdminUsers = () => {
  const navigate = useNavigate();
  const { user } = useUserData();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data } = await axios.get(`${server}/api/v1/admin/users`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUsers(data.users ?? []);
        setLoading(false);
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to load users"));
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const badgeClass = (role?: string) =>
    role === "admin"
      ? "bg-[#6C5CFF]/20 text-[#8E82FF]"
      : "bg-white/10 text-white/60";

  return (
    <div className="min-h-screen bg-[#17142B] p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Registered <span className="text-[#8E82FF]">Users</span>
            </h1>
            <p className="mt-1 text-sm text-white/60">
              All accounts registered in the app.
            </p>
          </div>
          <AdminNav />
        </div>

        <section className={`${cardClass} mt-8`}>
          <div className="flex items-center gap-2">
            <FiUsers className="text-[#8E82FF]" size={22} />
            <h2 className="text-xl font-semibold text-white">All accounts</h2>
            <span className="ml-auto rounded-full bg-[#6C5CFF]/20 px-3 py-1 text-xs font-semibold text-[#8E82FF]">
              {users.length} {users.length === 1 ? "user" : "users"}
            </span>
          </div>

          {loading ? (
            <p className="mt-5 text-sm text-white/60">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="mt-5 text-sm text-white/60">No registered users yet.</p>
          ) : (
            <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
              {users.map((u, i) => {
                const joined = u.createdAt
                  ? new Date(u.createdAt).toLocaleDateString()
                  : "—";
                const isAdmin = u.role === "admin";
                return (
                  <div
                    key={u._id}
                    className={`flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${
                      i % 2 === 0 ? "bg-white/[0.03]" : ""
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-white">{u.name || u.username}</p>
                      <p className="text-sm text-white/50">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-white/40">Joined {joined}</span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(
                          u.role
                        )}`}
                      >
                        {isAdmin ? "Admin" : "User"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminUsers;