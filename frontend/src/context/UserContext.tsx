import axios from "axios";
import { useEffect, useState, type ReactNode } from "react";
import toast, { Toaster } from "react-hot-toast";
import { UserContext } from "./userContext";
import type { User } from "../types";

const server = import.meta.env.VITE_USER_SERVER_URL || "http://localhost:6000";

interface UserProviderProps {
  children: ReactNode;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)
      ?.message;
    return message || fallback;
  }
  return fallback;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  async function registerUser(
    name: string,
    email: string,
    password: string,
    navigate: (path: string) => void
  ) {
    setBtnLoading(true);
    try {
      const { data } = await axios.post(`${server}/api/v1/user/register`, {
        name,
        email,
        password,
      });

      toast.success(data.message);
      localStorage.setItem("token", data.token);
      setUser(data.user);
      setIsAuth(true);
      navigate("/");
    } catch (error) {
      toast.error(getErrorMessage(error, "An error occurred"));
    } finally {
      setBtnLoading(false);
    }
  }

  async function loginUser(
    email: string,
    password: string,
    navigate: (path: string) => void
  ) {
    setBtnLoading(true);
    try {
      const { data } = await axios.post(`${server}/api/v1/user/login`, {
        email,
        password,
      });

      toast.success(data.message);
      localStorage.setItem("token", data.token);
      setUser(data.user);
      setIsAuth(true);
      navigate("/");
    } catch (error) {
      toast.error(getErrorMessage(error, "An error occurred"));
    } finally {
      setBtnLoading(false);
    }
  }

  useEffect(() => {
    const loadUser = async () => {
      const token = await Promise.resolve(localStorage.getItem("token"));
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await axios.get(`${server}/api/v1/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(data.user);
        setIsAuth(true);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  async function logoutUser() {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuth(false);
    toast.success("User Logged Out");
  }

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        isAuth,
        btnLoading,
        loginUser,
        registerUser,
        logoutUser,
      }}
    >
      {children}
      <Toaster />
    </UserContext.Provider>
  );
};