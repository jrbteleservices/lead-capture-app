'use client';

export default function AdminDashboardPlaceholder() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-6 text-slate-300 font-sans">
      <div className="border border-slate-900 bg-slate-900/20 max-w-sm rounded-2xl p-6 space-y-2">
        <h1 className="text-xs font-mono tracking-widest text-emerald-400 uppercase">System Administration</h1>
        <p className="text-sm font-medium text-slate-400">
          Control Panel Node Offline. Secure database synchronization active.
        </p>
      </div>
    </div>
  );
}