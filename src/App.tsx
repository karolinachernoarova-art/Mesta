import { BrowserRouter, Routes, Route } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import Explore from "./pages/Explore";
import MapSearch from "./pages/MapSearch";
import PlaceDetail from "./pages/PlaceDetail";
import BookingFlow from "./pages/BookingFlow";
import BookingsList from "./pages/BookingsList";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import OwnerAnalytics from "./pages/OwnerAnalytics";
import { AuthProvider } from "./lib/AuthContext";
import { useEffect } from "react";
import { FeedbackProvider } from "./components/FeedbackProvider";
import InstallAppPrompt from "./components/InstallAppPrompt";
import DesktopWarning from "./components/DesktopWarning";

export default function App() {
  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }
  }, []);

  return (
    <AuthProvider>
      <FeedbackProvider>
        <BrowserRouter>
          <div className="font-sans antialiased text-[var(--text-main)] bg-[var(--bg-base)] min-h-screen selection:bg-[var(--brand-primary)]">
            <Routes>
              <Route path="/" element={<Explore />} />
              <Route path="/map" element={<MapSearch />} />
              <Route path="/place/:id" element={<PlaceDetail />} />
              <Route path="/book/:id" element={<BookingFlow />} />
              <Route path="/bookings" element={<BookingsList />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/owner-analytics" element={<OwnerAnalytics />} />
            </Routes>
            
            <Routes>
              <Route path="/" element={<BottomNav />} />
              <Route path="/map" element={<BottomNav />} />
              <Route path="/bookings" element={<BottomNav />} />
              <Route path="/profile" element={<BottomNav />} />
              <Route path="*" element={null} />
            </Routes>

            <InstallAppPrompt />
            <DesktopWarning />
          </div>
        </BrowserRouter>
      </FeedbackProvider>
    </AuthProvider>
  );
}
