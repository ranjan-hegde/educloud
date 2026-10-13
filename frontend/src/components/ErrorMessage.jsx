import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorMessage({ message = "Something went wrong.", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-4">
      <div className="rounded-full bg-rose-50 p-3.5 text-accent-coral mb-3">
        <AlertTriangle size={22} />
      </div>
      <p className="font-semibold text-navy-800">Unable to load data</p>
      <p className="text-sm text-navy-400 mt-1 max-w-xs">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary mt-4">
          <RotateCcw size={15} /> Try again
        </button>
      )}
    </div>
  );
}
