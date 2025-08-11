import SignUp from "./features/auth/SignUpPage";
import './App.css';
import { Route, Routes } from "react-router-dom";
import Login from "./features/auth/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";import Calendar from "./components/Calendar";
import CreateEvent from "./features/event/CreateEventPageTemp";
import Layout from "./components/layout/Layout";
import Profile from "./features/profile/ProfilePage";
import Dashboard from "./pages/DashboardPage";
import Event from "./features/event/EventPageTemp";

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