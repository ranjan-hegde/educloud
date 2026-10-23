import { useState, useEffect } from "react";
import {
  BookOpen,
  FileText,
  Video,
  Link2,
  BookMarked,
  Download,
  ExternalLink,
  Search,
  Filter,
  User,
  GraduationCap,
  Calendar,
  Layers,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";
import { usePersistentState } from "../../hooks/usePersistentState";
import * as facultyService from "../../services/facultyService";
import api from "../../services/api";

const types = ["All", "Notes", "PDF", "Video", "Link", "Study Material"];
const typeIcon = {
  Notes: FileText,
  PDF: FileText,
  Video: Video,
  Link: Link2,
  "Study Material": BookMarked,
};

export default function StudentCourseMaterials() {
  const [materials, setMaterials] = usePersistentState("courseMaterials");
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState("ALL");
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [selectedType, setSelectedType] = useState("All");
  const [search, setSearch] = useState("");
  const [activeMaterial, setActiveMaterial] = useState(null);

  useEffect(() => {
    async function loadFaculty() {
      const list = await facultyService.getFacultyList();
      setFacultyList(list || []);
    }
    loadFaculty();

    // Also fetch from backend if available
    async function fetchBackendMaterials() {
      try {
        const res = await api("/api/materials/student");
        const data = res?.data || res;
        if (Array.isArray(data) && data.length > 0) {
          setMaterials((prev) => {
            const map = new Map((prev || []).map((m) => [m.id, m]));
            data.forEach((m) => {
              map.set(m.id, {
                id: m.id,
                title: m.title,
                subject: m.subject,
                type: m.type || "Notes",
                description: m.description || "",
                fileUrl: m.fileUrl || null,
                faculty: m.faculty || "Faculty",
                facultyId: m.facultyId || null,
                date: m.uploadedAt ? new Date(m.uploadedAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
              });
            });
            return Array.from(map.values());
          });
        }
      } catch {
        // backend offline
      }
    }
    fetchBackendMaterials();
  }, [setMaterials]);

  // Extract distinct subjects from available materials
  const availableSubjects = Array.from(
    new Set((materials || []).map((m) => m.subject).filter(Boolean))
  );

  // Selected faculty info card
  const selectedFacultyObj =
    selectedFaculty !== "ALL"
      ? facultyList.find((f) => f.id === selectedFaculty || f.name === selectedFaculty)
      : null;

  // Filtered materials
  const filtered = (materials || []).filter((m) => {
    const matchesFaculty =
      selectedFaculty === "ALL" ||
      m.facultyId === selectedFaculty ||
      m.faculty === selectedFaculty ||
      (selectedFacultyObj && (m.faculty === selectedFacultyObj.name || m.facultyEmail === selectedFacultyObj.email));

    const matchesSubject = selectedSubject === "ALL" || m.subject === selectedSubject;
    const matchesType = selectedType === "All" || m.type === selectedType;
    const q = search.toLowerCase();
    const matchesSearch =
      (m.title || "").toLowerCase().includes(q) ||
      (m.description || "").toLowerCase().includes(q) ||
      (m.subject || "").toLowerCase().includes(q) ||
      (m.faculty || "").toLowerCase().includes(q);

    return matchesFaculty && matchesSubject && matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Materials & Study Resources"
        subtitle="Access lecture notes, PDFs, videos, and study guides uploaded by your verified faculty"
      />

      {/* Filter and Selection Section */}
      <div className="card p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Real Faculty Dropdown */}
          <div>
            <label className="label">Select Faculty Member</label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                className="input pl-9 text-xs"
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
              >
                <option value="ALL">All Faculty Members</option>
                {facultyList.map((f) => (
                  <option key={f.id} value={f.name}>
                    {f.name} ({f.department || "Faculty"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject Dropdown */}
          <div>
            <label className="label">Filter by Subject</label>
            <div className="relative">
              <GraduationCap size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                className="input pl-9 text-xs"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="ALL">All Subjects</option>
                {availableSubjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Material Type Dropdown */}
          <div>
            <label className="label">Material Type</label>
            <div className="relative">
              <Layers size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                className="input pl-9 text-xs"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Box */}
          <div>
            <label className="label">Search Resources</label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                className="input pl-9 text-xs"
                placeholder="Search title or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Selected Faculty Profile Banner (shown when a specific teacher is chosen) */}
        {selectedFacultyObj && (
          <div className="flex flex-wrap items-center justify-between p-3.5 bg-navy-50/60 border border-navy-100 rounded-xl text-xs gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-navy-900 text-white font-bold flex items-center justify-center text-xs">
                {selectedFacultyObj.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-navy-950 text-sm">{selectedFacultyObj.name}</p>
                <p className="text-slate-500">
                  {selectedFacultyObj.designation || "Faculty"} • {selectedFacultyObj.department} • {selectedFacultyObj.email}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="badge-teal">
                {filtered.length} {filtered.length === 1 ? "Material" : "Materials"} available
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Materials Grid */}
      {filtered.length === 0 ? (
        <div className="card p-8">
          <EmptyState
            icon={BookOpen}
            title="No Course Materials Found"
            message={
              selectedFaculty !== "ALL"
                ? `No course materials uploaded yet by ${selectedFaculty}. Materials will appear here as soon as your professor posts them.`
                : "No course materials match your current filters. Select a different subject or teacher."
            }
          />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((m) => {
            const Icon = typeIcon[m.type] || FileText;
            return (
              <div
                key={m.id}
                className="card p-5 flex flex-col justify-between hover:shadow-md transition-shadow border border-slate-200"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 rounded-xl bg-navy-50 text-navy-700 flex items-center justify-center shrink-0">
                      <Icon size={18} />
                    </div>
                    <span className="badge-blue text-[11px] font-semibold">{m.type}</span>
                  </div>

                  <h3 className="font-semibold text-navy-900 text-base leading-snug line-clamp-2">
                    {m.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-navy-700 font-medium">
                      {m.subject}
                    </span>
                    {m.faculty && (
                      <span className="text-slate-500 flex items-center gap-1">
                        <User size={12} /> {m.faculty}
                      </span>
                    )}
                  </div>

                  {m.description && (
                    <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                      {m.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Calendar size={12} /> {m.date || "Recent"}
                  </span>

                  <div className="flex items-center gap-2">
                    {m.fileUrl ? (
                      <a
                        href={m.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-primary !py-1 !px-2.5 text-xs flex items-center gap-1"
                      >
                        <ExternalLink size={12} /> Open
                      </a>
                    ) : (
                      <button
                        onClick={() => setActiveMaterial(m)}
                        className="btn-secondary !py-1 !px-2.5 text-xs flex items-center gap-1"
                      >
                        View Notes
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        open={!!activeMaterial}
        onClose={() => setActiveMaterial(null)}
        title={activeMaterial?.title || "Material Details"}
        footer={
          <button className="btn-secondary" onClick={() => setActiveMaterial(null)}>
            Close
          </button>
        }
      >
        {activeMaterial && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Subject:</span>
                <span className="font-semibold text-navy-900">{activeMaterial.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Faculty Author:</span>
                <span className="font-medium text-navy-900">{activeMaterial.faculty || "Faculty"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Type:</span>
                <span className="font-medium text-navy-800">{activeMaterial.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date Posted:</span>
                <span className="font-mono text-navy-800">{activeMaterial.date}</span>
              </div>
            </div>

            <div>
              <label className="label">Description / Study Notes</label>
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl text-slate-700 whitespace-pre-wrap leading-relaxed">
                {activeMaterial.description || "No additional description provided."}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
