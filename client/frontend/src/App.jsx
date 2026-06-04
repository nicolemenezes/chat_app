import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ChatPage from "./pages/ChatPage";
import JoinPage from "./pages/JoinPage";

export default function App() {
  const { user, token } = useAuth();

  return (
    <SocketProvider token={token}>
      <Routes>
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
        <Route path="/join/:code" element={user ? <JoinPage /> : <Navigate to="/login" />} />
        <Route path="/*" element={user ? <ChatPage /> : <Navigate to="/login" />} />
      </Routes>
    </SocketProvider>
  );
}