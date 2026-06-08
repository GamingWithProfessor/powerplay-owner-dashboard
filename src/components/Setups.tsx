import { useState } from "react";
import { Plus, Trash2, Edit3, X } from "lucide-react";
import type { Setup } from "../types";
import { uid } from "../store";

const types: Setup["type"][]    = ["PS5","Xbox","PC","VR","Racing Sim","Other"];
const statuses: Setup["status"][] = ["Active","Maintenance","Inactive"];

const statusStyle: Record<Setup["status"], string> = {
  Active:      "badge badge-green",
  Maintenance: "badge badge-amber",
  Inactive:    "badge badge-slate",
};

export default function Setups({ setups, setSetups }: {
  setups: Setup[];
  setSetups: React.Dispatch<React.SetStateAction<Setup[]>>;
}) {
  const [editing, setEditing] = useState<Setup | null>(null);
  const [showForm, setShowForm] = useState(false);

  const save = (s: Setup) => {
    setSetups((prev) => {
      const i = prev.findIndex((x) => x.id === s.id);
      if (i >= 0) { const c = [...prev]; c[i] = s; return c; }
      return [...prev, s];
    });
    setEditing(null); setShowForm(false);
  };

  const remove = (id: string) => {
    if (!confirm("Remove this setup?")) return;
    setSetups((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[15px] font-bold text-white">Setups</p>
          <p className="text-[12px] text-slate-500 mt-0.5">Manage gaming stations available for booking.</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary">
          <Plus className="h-3.5 w-3.5" /> Add Setup
        </button>
      </div>

      {setups.length === 0 ? (
        <div className="py-10 text-center rounded-2xl" style={{ border: "1px dashed rgba(255,255,255,0.06)" }}>
          <p className="text-[13px] text-slate-500">No setups yet. Add your first setup.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {setups.map((s) => (
            <div key={s.id}
              className="rounded-2xl p-4 flex flex-col gap-3 transition-all duration-200"
              style={{ background: "rgba(13,17,32,0.7)", border: "1px solid rgba(255,255,255,0.05)" }}
              onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(99,102,241,0.2)"}
              onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.05)"}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-white truncate">{s.name}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">{s.location || "No location"}</p>
                </div>
                <span className={statusStyle[s.status]}>{s.status}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge badge-blue">{s.type}</span>
                {s.notes && <p className="text-[11px] text-slate-600 truncate">{s.notes}</p>}
              </div>
              <div className="flex gap-2 mt-auto pt-1">
                <button onClick={() => { setEditing(s); setShowForm(true); }} className="btn-ghost flex-1 text-[12px]">
                  <Edit3 className="h-3 w-3" /> Edit
                </button>
                <button onClick={() => remove(s.id)} className="btn-danger text-[12px]">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <SetupForm initial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSave={save} />
      )}
    </div>
  );
}

function SetupForm({ initial, onClose, onSave }: {
  initial: Setup | null; onClose: () => void; onSave: (s: Setup) => void;
}) {
  const [name,     setName]     = useState(initial?.name ?? "");
  const [type,     setType]     = useState<Setup["type"]>(initial?.type ?? "PS5");
  const [status,   setStatus]   = useState<Setup["status"]>(initial?.status ?? "Active");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [notes,    setNotes]    = useState(initial?.notes ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ id: initial?.id ?? uid(), name: name.trim(), type, status, location: location.trim(), notes: notes.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 p-0"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}>
      <form onSubmit={submit} className="modal-sheet w-full space-y-4 overflow-y-auto max-h-[92dvh]">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-bold text-white">{initial ? "Edit Setup" : "New Setup"}</h3>
          <button type="button" onClick={onClose} className="btn-ghost h-8 w-8 p-0"><X className="h-4 w-4" /></button>
        </div>

        <FL label="Setup Name">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. PS5 Lounge — Desk 1" className="input" required />
        </FL>

        <div className="grid grid-cols-2 gap-3">
          <FL label="Type">
            <select value={type} onChange={(e) => setType(e.target.value as Setup["type"])} className="input">
              {types.map((t) => <option key={t}>{t}</option>)}
            </select>
          </FL>
          <FL label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value as Setup["status"])} className="input">
              {statuses.map((s) => <option key={s}>{s}</option>)}
            </select>
          </FL>
        </div>

        <FL label="Location">
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Zone A / Desk 3" className="input" />
        </FL>

        <FL label="Notes">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="input" style={{ resize: "none" }} />
        </FL>

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" className="btn-primary">{initial ? "Save" : "Add Setup"}</button>
        </div>
      </form>
    </div>
  );
}

function FL({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="section-label block mb-1.5">{label}</span>
      {children}
    </label>
  );
}
