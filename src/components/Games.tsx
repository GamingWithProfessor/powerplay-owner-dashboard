import { useState } from "react";
import { Plus, Trash2, Edit3, X } from "lucide-react";
import type { Game } from "../types";
import { uid } from "../store";

const genres = ["Action","FPS","Battle Royale","Sports","Racing","Open World","Survival","Horror","Puzzle","RPG"];
const platforms = ["PS5","Xbox","PC","VR","All"];

export default function Games({ games, setGames }: {
  games: Game[];
  setGames: React.Dispatch<React.SetStateAction<Game[]>>;
}) {
  const [editing, setEditing] = useState<Game | null>(null);
  const [showForm, setShowForm] = useState(false);

  const save = (g: Game) => {
    setGames((prev) => {
      const i = prev.findIndex((x) => x.id === g.id);
      if (i >= 0) { const c = [...prev]; c[i] = g; return c; }
      return [...prev, g];
    });
    setEditing(null); setShowForm(false);
  };

  const remove = (id: string) => {
    if (!confirm("Remove this game?")) return;
    setGames((prev) => prev.filter((g) => g.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[15px] font-bold text-white">Game Library</p>
          <p className="text-[12px] text-slate-500 mt-0.5">Games shown when creating a booking.</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary">
          <Plus className="h-3.5 w-3.5" /> Add Game
        </button>
      </div>

      {games.length === 0 ? (
        <div className="py-10 text-center rounded-2xl" style={{ border: "1px dashed rgba(255,255,255,0.06)" }}>
          <p className="text-[13px] text-slate-500">No games in library yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {games.map((g) => (
            <div key={g.id}
              className="rounded-2xl p-4 flex flex-col gap-3 transition-all duration-200"
              style={{ background: "rgba(13,17,32,0.7)", border: "1px solid rgba(255,255,255,0.05)" }}
              onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(168,85,247,0.25)"}
              onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.05)"}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[14px] font-bold text-white truncate">{g.name}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {g.genre && <span className="badge badge-purple">{g.genre}</span>}
                {g.platform && <span className="badge badge-cyan">{g.platform}</span>}
              </div>
              <div className="flex gap-2 mt-auto pt-1">
                <button onClick={() => { setEditing(g); setShowForm(true); }} className="btn-ghost flex-1 text-[12px]">
                  <Edit3 className="h-3 w-3" /> Edit
                </button>
                <button onClick={() => remove(g.id)} className="btn-danger text-[12px]">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <GameForm initial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSave={save} />
      )}
    </div>
  );
}

function GameForm({ initial, onClose, onSave }: {
  initial: Game | null; onClose: () => void; onSave: (g: Game) => void;
}) {
  const [name,        setName]       = useState(initial?.name ?? "");
  const [genre,       setGenre]      = useState(initial?.genre ?? "");
  const [platform,    setPlatform]   = useState(initial?.platform ?? "All");
  const [customGenre, setCustomGenre] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ id: initial?.id ?? uid(), name: name.trim(), genre: genre === "Other" ? customGenre.trim() || "Other" : genre || undefined, platform: platform === "All" ? undefined : platform });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 p-0"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}>
      <form onSubmit={submit} className="modal-sheet w-full space-y-4 overflow-y-auto max-h-[92dvh]">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-bold text-white">{initial ? "Edit Game" : "New Game"}</h3>
          <button type="button" onClick={onClose} className="btn-ghost h-8 w-8 p-0"><X className="h-4 w-4" /></button>
        </div>

        <label className="block">
          <span className="section-label block mb-1.5">Game Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. BGMI, FIFA 25" className="input" required />
        </label>

        <label className="block">
          <span className="section-label block mb-1.5">Genre</span>
          <select value={genre} onChange={(e) => setGenre(e.target.value)} className="input">
            <option value="">— Select genre —</option>
            {genres.map((g) => <option key={g}>{g}</option>)}
            <option value="Other">Other</option>
          </select>
          {genre === "Other" && (
            <input value={customGenre} onChange={(e) => setCustomGenre(e.target.value)} placeholder="Enter genre" className="input mt-2" />
          )}
        </label>

        <label className="block">
          <span className="section-label block mb-1.5">Platform</span>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="input">
            {platforms.map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" className="btn-primary">{initial ? "Save Changes" : "Add Game"}</button>
        </div>
      </form>
    </div>
  );
}
