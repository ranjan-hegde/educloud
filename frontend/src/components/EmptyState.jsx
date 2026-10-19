import { Inbox } from "lucide-react";

export default function EmptyState({ icon: Icon = Inbox, title = "Nothing here yet", message, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <div className="rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 p-3.5 text-slate-400 dark:text-slate-500 mb-3 shadow-xs">
        <Icon size={22} />
      </div>
      <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{title}</p>
      {message && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs leading-relaxed">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
