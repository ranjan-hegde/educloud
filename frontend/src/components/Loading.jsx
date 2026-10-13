export default function Loading({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="h-8 w-8 rounded-full border-2 border-navy-100 border-t-navy-700 animate-spin" />
      <p className="text-sm text-navy-400">{label}</p>
    </div>
  );
}
