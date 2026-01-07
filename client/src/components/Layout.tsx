import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, TrendingUp, LogOut, Hexagon } from "lucide-react";
import { useEffect, useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [vendorId, setVendorId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("growguide_vendor_id");
    if (!stored && location !== "/" && location !== "/setup") {
      setLocation("/");
    }
    setVendorId(stored);
  }, [location, setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("growguide_vendor_id");
    setLocation("/");
  };

  if (location === "/" || location === "/setup") {
    return <>{children}</>;
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/collaboration", label: "Collaboration", icon: Users },
    { href: "/expansion", label: "Expansion", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-b md:border-r border-slate-200 flex-shrink-0 sticky top-0 md:h-screen z-10">
        <div className="p-6 flex items-center space-x-2 border-b border-slate-100">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <Hexagon className="w-6 h-6 fill-current" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 font-display">
            GrowGuide
          </span>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div 
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group
                    ${isActive 
                      ? "bg-primary text-white shadow-lg shadow-primary/25" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}
                  `}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400 group-hover:text-primary"}`} />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-100 hidden md:block">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
