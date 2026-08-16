import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { UserCheck, CheckCircle2, XCircle, Code2, Building2, IdCard, Mail, ShieldAlert, Sparkles } from "lucide-react";

export default function FacultyApprovalManager() {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Available lab subjects per department cache
  const [availableLabs, setAvailableLabs] = useState([]);
  // Selected lab subject IDs per faculty member ID map { [facultyId]: [labId1, labId2] }
  const [selectedLabsMap, setSelectedLabsMap] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  useEffect(() => {
    fetchPendingData();
  }, []);

  const fetchPendingData = async () => {
    setLoading(true);
    try {
      const [facRes, labsRes] = await Promise.all([
        api.getPendingFaculties(),
        api.getLabSubjects(),
      ]);

      if (facRes.success) {
        setFaculties(facRes.faculties || []);
      }
      if (labsRes.success) {
        setAvailableLabs(labsRes.labSubjects || []);
      }
    } catch (err) {
      console.error("Failed to load pending faculty requests", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleLabSelection = (facultyId, labId) => {
    setSelectedLabsMap((prev) => {
      const currentLabs = prev[facultyId] || [];
      const exists = currentLabs.includes(labId);
      const updated = exists
        ? currentLabs.filter((id) => id !== labId)
        : [...currentLabs, labId];
      return { ...prev, [facultyId]: updated };
    });
  };

  const handleApprove = async (facultyId) => {
    const assignedLabs = selectedLabsMap[facultyId] || [];
    if (assignedLabs.length === 0) {
      alert("Please select at least one programming lab subject to assign to this faculty member.");
      return;
    }

    setSubmittingId(facultyId);
    try {
      const res = await api.approveFacultyWithLabs(facultyId, assignedLabs);
      if (res.success) {
        alert(res.message);
        setFaculties((prev) => prev.filter((f) => f._id !== facultyId));
      } else {
        alert(res.message || "Failed to approve faculty");
      }
    } catch (err) {
      alert("Error approving faculty");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleReject = async (facultyId) => {
    if (!confirm("Are you sure you want to reject and remove this faculty registration request?")) return;

    setSubmittingId(facultyId);
    try {
      const res = await api.rejectFaculty(facultyId);
      if (res.success) {
        setFaculties((prev) => prev.filter((f) => f._id !== facultyId));
      } else {
        alert(res.message || "Failed to reject request");
      }
    } catch (err) {
      alert("Error rejecting faculty request");
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-violet-400"></div>
        Loading pending faculty registration requests...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-3xl glass-panel border border-violet-500/20 bg-violet-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-violet-400" /> Pending Faculty Approval & Lab Subject Assignment
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Review faculty registration requests verified against official records. Select and assign programming lab subjects before approving.
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-mono font-bold shrink-0">
          {faculties.length} Pending Approval{faculties.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Pending List */}
      {faculties.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center space-y-2.5 shadow-md">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Pending Faculty Approvals</h3>
          <p className="text-xs text-slate-400">
            All registered faculty members have been assigned lab subjects and approved.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {faculties.map((fac) => {
            const facultyDeptId = fac.department?._id || fac.department;
            // Filter lab subjects belonging to this faculty's department (or all if dept not specified)
            const deptLabs = availableLabs.filter(
              (lab) => !facultyDeptId || (lab.department?._id || lab.department) === facultyDeptId
            );
            const currentSelectedLabs = selectedLabsMap[fac._id] || [];

            return (
              <div
                key={fac._id}
                className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 hover:border-violet-500/40 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{fac.name}</h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[10px] uppercase font-bold border border-violet-500/30">
                        {fac.designation || "Faculty"}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-mono text-cyan-300">
                        <IdCard className="w-3.5 h-3.5" /> ID: {fac.employeeId || "N/A"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> {fac.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-violet-400" /> {fac.department?.name || "Dept N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleReject(fac._id)}
                      disabled={submittingId === fac._id}
                      className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" /> Reject Request
                    </button>
                    <button
                      onClick={() => handleApprove(fac._id)}
                      disabled={submittingId === fac._id}
                      className="px-4 py-2 rounded-xl neu-btn-primary text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve & Assign Labs ({currentSelectedLabs.length})
                    </button>
                  </div>
                </div>

                {/* Lab Subject Selection Checkboxes */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-violet-400" /> Select Programming Labs to Assign:
                    </span>
                    <span className="text-[11px] text-violet-300 font-mono font-bold">
                      {currentSelectedLabs.length} Selected
                    </span>
                  </label>

                  {deptLabs.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      No lab subjects configured for department "{fac.department?.name || "Selected Dept"}". Please configure lab subjects in Academic Manager first.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {deptLabs.map((lab) => {
                        const isSelected = currentSelectedLabs.includes(lab._id);
                        return (
                          <button
                            type="button"
                            key={lab._id}
                            onClick={() => toggleLabSelection(fac._id, lab._id)}
                            className={`p-3 rounded-2xl text-left border transition-all flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? "bg-violet-500/25 border-violet-400 text-white font-bold shadow-[0_0_12px_rgba(139,92,246,0.25)]"
                                : "bg-[#090e1a] border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"
                            }`}
                          >
                            <div>
                              <div className="font-bold text-xs">{lab.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{lab.code}</div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-mono font-bold uppercase border border-violet-500/30">
                              {lab.requiredLanguage}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
