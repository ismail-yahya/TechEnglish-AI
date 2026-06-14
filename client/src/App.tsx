import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import { useThemeStore } from "./stores/themeStore";
import Sidebar from "./components/Sidebar";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import StoriesPage from "./pages/StoriesPage";
import StoryReaderPage from "./pages/StoryReaderPage";
import VocabularyPage from "./pages/VocabularyPage";
import PracticePage from "./pages/PracticePage";
import ProfilePage from "./pages/ProfilePage";

function ProtectedLayout() {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner" style={{ width: 32, height: 32 }} />
        <p style={{ color: "var(--text-secondary)" }}>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Force profile setup if domains are empty
  if (
    user &&
    (!user.chosenDomains || user.chosenDomains.length === 0) &&
    location.pathname !== "/profile"
  ) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="flex h-screen w-full bg-background/50 overflow-hidden relative z-0">
      <div className="absolute inset-0 z-[-1] pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-[120px]" />
      </div>
      <Sidebar />
      <main className="flex-1 h-full overflow-y-auto w-full p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto w-full h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function App() {
  const { loadUser, isAuthenticated, isLoading } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LandingPage />
            )
          }
        />

        <Route
          path="/login"
          element={
            isLoading ? (
              <div className="loading-screen">
                <div className="spinner" style={{ width: 32, height: 32 }} />
              </div>
            ) : isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage />
            )
          }
        />

        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/stories" element={<StoriesPage />} />
          <Route path="/stories/:id" element={<StoryReaderPage />} />
          <Route path="/vocabulary" element={<VocabularyPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
