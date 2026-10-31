import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Signalify",
  description: "Professional AI workforce infrastructure",
};

const navigation = [
  { href: "/", label: "Dashboard" },
  { href: "/employees", label: "AI Employees" },
  { href: "/agent-factory", label: "Agent Factory" },
  { href: "/models", label: "Models & Providers" },
  { href: "/tasks", label: "Tasks & Work" },
  { href: "/tools", label: "Tools & Integrations" },
  { href: "/settings", label: "Settings" },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <aside className="sidebar">
            <div className="brand">
              <div className="brand-mark">S</div>
              <div>
                <strong>Signalify</strong>
                <span>AI workforce</span>
              </div>
            </div>
            <nav className="nav">
              {navigation.map((link) => (
                <a key={link.href} href={link.href} className="nav-link">
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="sidebar-footer">
              <span>Phase 1</span>
              <strong>Core Infrastructure</strong>
            </div>
          </aside>
          <main className="content">{children}</main>
        </div>
      </body>
    </html>
  );
}
