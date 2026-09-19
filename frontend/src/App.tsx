import { BrowserRouter as Router, Navigate, Routes, Route } from "react-router-dom"
import Homepage from "./pages/Homepage"
import Login from "./pages/Login"
import Register from "./pages/Register"
import NotFound from "./pages/NotFound"
import BadRequest from "./pages/BadRequest"
import WrongEndpoint from "./pages/WrongEndpoint"
import PlayList from "./pages/PlayList"
import Admin from "./pages/Admin"
import { useUserData } from "./context/userContext"

interface ProtectedRouteProps {
  children: React.ReactNode
  adminOnly?: boolean
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { isAuth, user } = useUserData()

  if (!isAuth) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/" replace />
  }

  return children
}

const App = () => {
  const { isAuth } = useUserData()

  return (
      <>
        <Router>
          <Routes>
                  <Route path="/" element={<Homepage />} />
                  <Route path="/login" element={isAuth ? <Navigate to="/" replace /> : <Login />} />
                    <Route path="/register" element={isAuth ? <Navigate to="/" replace /> : <Register />} />
                    <Route path="/playlist" element={<ProtectedRoute><PlayList /></ProtectedRoute>} />
                    <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
                    <Route path="/404" element={<NotFound />} />
                    <Route path="/400" element={<BadRequest />} />
                    <Route path="/405" element={<WrongEndpoint />} />
                    <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </>
  )
}

export default App