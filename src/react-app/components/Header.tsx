import { Link, useLocation } from "react-router";
import { Activity } from "lucide-react";

export default function Header() {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-foreground">HealthLedger</span>
          </Link>

          {isLanding && (
            <nav className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-5 py-2.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 text-sm font-medium bg-primary text-white rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25"
              >
                Register
              </Link>
            </nav>
          )}

          {!isLanding && (
            <nav className="flex items-center gap-2 sm:gap-4">
              <Link
                to="/dashboard"
                className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/admin"
                className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Admin
              </Link>
              <Link
                to="/"
                className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25"
              >
                Logout
              </Link>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
