import { Inbox } from "lucide-react";

export default function EmptyState({ icon: Icon = Inbox, title = "Nothing here yet", message, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-4">
      <div className="rounded-full bg-navy-50 p-3.5 text-navy-400 mb-3">
        <Icon size={22} />
      </div>
      <p className="font-semibold text-navy-800">{title}</p>
      {message && <p className="text-sm text-navy-400 mt-1 max-w-xs">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
