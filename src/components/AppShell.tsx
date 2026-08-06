"use client";
import StarField from "./StarField";
import NavDrawer from "./NavDrawer";
import ReleaseNoteSheet from "./ReleaseNoteSheet";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <StarField />
      {children}
      <NavDrawer />
      <ReleaseNoteSheet />
    </div>
  );
}
