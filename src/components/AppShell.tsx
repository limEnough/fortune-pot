"use client";
import StarField from "./StarField";
import NavDrawer from "./NavDrawer";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <StarField />
      {children}
      <NavDrawer />
    </div>
  );
}
