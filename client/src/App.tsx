import SignUp from "./features/auth/SignUp";
import './App.css';
import { Route, Routes } from "react-router-dom";
import Login from "./features/auth/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/dashboard";
import Profile from "./features/Profile";
import Calendar from "./components/Calendar";
import CreateEvent from "./pages/createEvent";
import Layout from "./pages/layout/Layout";
import Event from "./pages/event";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/event/:publicId" element={<Event />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
