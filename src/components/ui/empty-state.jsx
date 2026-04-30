import { Inbox } from "lucide-react";

export function EmptyState({ 
  icon: Icon = Inbox, 
  title = "Data Kosong", 
  description = "Belum ada data yang bisa ditampilkan di sini.",
  className = "" 
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="bg-slate-100 p-4 rounded-full mb-4">
        <Icon className="h-10 w-10 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">
        {description}
      </p>
    </div>
  );
}
