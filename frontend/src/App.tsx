import { Navigate, Routes, Route } from "react-router-dom"
import Homepage from "./pages/Homepage"
import Login from "./pages/Login"
import Register from "./pages/Register"
import NotFound from "./pages/NotFound"
import BadRequest from "./pages/BadRequest"
import WrongEndpoint from "./pages/WrongEndpoint"
import PlayList from "./pages/PlayList"
import Search from "./pages/Search"
import Admin from "./pages/Admin"
import AdminUsers from "./pages/AdminUsers"
import ComingSoon from "./pages/ComingSoon"
import Album from "./pages/Album"
import { useUserData } from "./context/userContext"
import Loading from "./components/Loading"

interface ProtectedRouteProps {
  children: React.ReactNode
  adminOnly?: boolean
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { isAuth, loading, user } = useUserData()

  if (loading) {
    return <Loading />
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/" replace />
  }

  return children
}

const App = () => {
  const { isAuth, loading } = useUserData()

  return (
      <>
        <Routes>
                  <Route path="/" element={<ProtectedRoute><Homepage /></ProtectedRoute>} />
                  <Route path="/login" element={loading ? <Loading /> : isAuth ? <Navigate to="/" replace /> : <Login />} />
                    <Route path="/register" element={loading ? <Loading /> : isAuth ? <Navigate to="/" replace /> : <Register />} />
                    <Route path="/playlist" element={<ProtectedRoute><PlayList /></ProtectedRoute>} />
                    <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
                    <Route path="/album/:id" element={<ProtectedRoute><Album /></ProtectedRoute>} />
                    <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
                    <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
                    <Route path="/coming-soon" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
                    <Route path="/404" element={<NotFound />} />
                    <Route path="/400" element={<BadRequest />} />
                    <Route path="/405" element={<WrongEndpoint />} />
                    <Route path="*" element={<NotFound />} />
        </Routes>
      </>
  )
}

export default App