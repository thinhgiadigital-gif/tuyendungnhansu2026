import { useState, useEffect } from "react";
import { 
  Search, 
  Trash2, 
  Download, 
  ArrowLeft, 
  Eye, 
  Calendar, 
  Briefcase, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  SlidersHorizontal,
  X,
  FileSpreadsheet,
  LogOut,
  FileText,
  Paperclip
} from "lucide-react";
import { Candidate } from "../types";

interface AdminDashboardProps {
  onBack: () => void;
}

const SEED_CANDIDATES: Candidate[] = [];

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("Tất cả");
  const [selectedBranch, setSelectedBranch] = useState("Tất cả");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showDeleteConfirmId, setShowDeleteConfirmId] = useState<string | null>(null);

  // Load from local storage and filter out any remaining mock seed candidates
  useEffect(() => {
    const rawData = localStorage.getItem("thinhgia_candidates");
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData) as Candidate[];
        // Filter out any candidates with ids starting with "cand-" to clean up previous mock users
        const cleaned = parsed.filter(c => !c.id.startsWith("cand-"));
        setCandidates(cleaned);
        localStorage.setItem("thinhgia_candidates", JSON.stringify(cleaned));
      } catch (e) {
        console.error("Lỗi parse dữ liệu ứng viên:", e);
        setCandidates([]);
        localStorage.setItem("thinhgia_candidates", JSON.stringify([]));
      }
    } else {
      setCandidates([]);
      localStorage.setItem("thinhgia_candidates", JSON.stringify([]));
    }
  }, []);

  // Filter candidates
  const filteredCandidates = candidates.filter(candidate => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = 
      candidate.fullName.toLowerCase().includes(searchLower) ||
      candidate.phone.includes(searchTerm) ||
      candidate.email.toLowerCase().includes(searchLower);

    const matchPosition = selectedPosition === "Tất cả" || candidate.position === selectedPosition;
    const matchBranch = selectedBranch === "Tất cả" || candidate.branch === selectedBranch;

    return matchSearch && matchPosition && matchBranch;
  });

  // Calculate stats
  const totalCandidates = candidates.length;
  const todayCount = candidates.filter(c => {
    const todayStr = new Date().toDateString();
    return new Date(c.createdAt).toDateString() === todayStr;
  }).length;

  const positionStats = candidates.reduce((acc, curr) => {
    acc[curr.position] = (acc[curr.position] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const branchStats = candidates.reduce((acc, curr) => {
    acc[curr.branch] = (acc[curr.branch] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Delete handler
  const handleDelete = (id: string) => {
    const updated = candidates.filter(c => c.id !== id);
    setCandidates(updated);
    localStorage.setItem("thinhgia_candidates", JSON.stringify(updated));
    if (selectedCandidate?.id === id) {
      setSelectedCandidate(null);
    }
    setShowDeleteConfirmId(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("thinhgia_admin_authenticated");
    localStorage.removeItem("thinhgia_admin_session_time");
    onBack();
  };

  const handleDownloadCV = (candidate: Candidate) => {
    if (!candidate.cvData || !candidate.cvName) return;
    try {
      const link = document.createElement("a");
      link.href = candidate.cvData;
      link.download = candidate.cvName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Lỗi tải xuống CV:", err);
    }
  };

  // Export to CSV helper
  const handleExportCSV = () => {
    if (filteredCandidates.length === 0) {
      alert("Không có dữ liệu để xuất!");
      return;
    }

    // Add columns with BOM header so Excel renders Vietnamese accent characters correctly
    const headers = ["Họ và tên", "Số điện thoại", "Email", "Vị trí ứng tuyển", "Văn phòng ứng tuyển", "Kinh nghiệm", "Ghi chú / lời nhắn", "Thời gian đăng ký"];
    const rows = filteredCandidates.map(c => [
      c.fullName,
      c.phone,
      c.email,
      c.position,
      c.branch,
      c.experience,
      c.note || "Không có",
      new Date(c.createdAt).toLocaleString("vi-VN")
    ]);
    
    // Add UTF-8 Byte Order Mark
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Danh_sach_ung_vien_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format position into badges color classes
  const getPositionBadgeClass = (pos: string) => {
    switch (pos) {
      case "Chuyên viên Kinh doanh":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Chuyên viên Marketing":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Trưởng nhóm Kinh doanh":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="bg-[#fcf8f2] min-h-screen text-brand-brown antialiased font-sans">
      {/* Top Header Navigation */}
      <div className="bg-white border-b border-brand-brown/5 sticky top-0 z-30 shadow-subtle px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2.5 bg-brand-gray hover:bg-brand-yellow/10 hover:text-brand-brown rounded-2xl border border-transparent hover:border-brand-yellow/20 transition-all flex items-center justify-center"
              title="Quay lại trang chính"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-yellow animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-brown/40">Thịnh Gia Land HR Portal</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight mt-0.5">Quản lý Ứng viên</h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-5 py-3 bg-[#107c41] hover:bg-[#0e6c38] hover:scale-[1.02] active:scale-95 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-800/10 transition-all cursor-pointer"
            >
              <FileSpreadsheet size={18} />
              Xuất FILE EXCEL / CSV
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-3 bg-brand-brown hover:bg-[#3d240f] hover:scale-[1.02] active:scale-95 text-white font-black text-sm rounded-2xl shadow-lg transition-all cursor-pointer border border-[#a88d6c]/10"
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut size={16} className="text-brand-yellow" />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* KPI Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Candidates */}
          <div className="bg-white rounded-3xl p-6 border border-brand-brown/5 shadow-premium flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#a88d6c]">Tổng số ứng viên</span>
              <div className="text-4xl font-black">{totalCandidates}</div>
              <span className="text-xs text-[#8c7456]">Nhiệt huyết gia nhập</span>
            </div>
            <div className="w-14 h-14 bg-[#fcf8f2] rounded-2xl flex items-center justify-center text-brand-yellow">
              <User size={26} strokeWidth={2.5} />
            </div>
          </div>

          {/* Today Register */}
          <div className="bg-white rounded-3xl p-6 border border-brand-brown/5 shadow-premium flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#a88d6c]">Đăng ký hôm nay</span>
              <div className="text-4xl font-black">{todayCount}</div>
              <span className="text-xs text-brand-yellow font-bold flex items-center gap-1">
                <Clock size={12} /> Cập nhật thời gian thực
              </span>
            </div>
            <div className="w-14 h-14 bg-brand-yellow/10 rounded-2xl flex items-center justify-center text-brand-yellow">
              <Calendar size={26} strokeWidth={2.5} />
            </div>
          </div>

          {/* Position Distribution */}
          <div className="bg-white rounded-3xl p-6 border border-brand-brown/5 shadow-premium flex items-center justify-between">
            <div className="space-y-1 cursor-pointer">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#a88d6c]">Vị trí nhiều nhất</span>
              <div className="text-base font-black truncate max-w-[180px]">
                {Object.keys(positionStats).sort((a: string, b: string) => positionStats[b] - positionStats[a])[0] || "Chưa có"}
              </div>
              <span className="text-xs text-[#8c7456]">
                {Object.values(positionStats).sort((a: number, b: number) => b - a)[0] || 0} hồ sơ ứng tuyển
              </span>
            </div>
            <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600">
              <Briefcase size={26} strokeWidth={2.5} />
            </div>
          </div>

          {/* Location Distribution */}
          <div className="bg-white rounded-3xl p-6 border border-brand-brown/5 shadow-premium flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#a88d6c]">Cơ sở nộp nhiều nhất</span>
              <div className="text-base font-black truncate max-w-[180px]">
                {Object.keys(branchStats).sort((a: string, b: string) => branchStats[b] - branchStats[a])[0] || "Chưa có"}
              </div>
              <span className="text-xs text-[#8c7456]">
                {Object.values(branchStats).sort((a: number, b: number) => b - a)[0] || 0} hồ sơ ứng tuyển
              </span>
            </div>
            <div className="w-14 h-14 bg-[#705531]/10 rounded-2xl flex items-center justify-center text-[#705531]">
              <MapPin size={26} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Filters and List Box */}
        <div className="bg-white rounded-[2rem] border border-brand-brown/5 shadow-premium overflow-hidden">
          {/* Header Panel Filter */}
          <div className="bg-brand-gray/50 border-b border-brand-brown/5 p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <SlidersHorizontal size={16} className="text-brand-yellow" />
              <h2 className="text-xs font-black uppercase tracking-widest text-brand-brown-light">Bộ lọc danh sách</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Bar */}
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-brown/40" />
                <input
                  type="text"
                  placeholder="Tìm theo Tên, Số điện thoại, Email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-brand-brown/10 focus:border-brand-yellow outline-none text-sm transition-all shadow-sm"
                />
              </div>

              {/* Position Filter */}
              <div>
                <select
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value)}
                  className="w-full px-4 py-3 bg-white rounded-2xl border border-brand-brown/10 focus:border-brand-yellow outline-none text-sm transition-all appearance-none cursor-pointer shadow-sm"
                >
                  <option value="Tất cả">Tất cả vị trí ứng tuyển</option>
                  <option value="Chuyên viên Kinh doanh">Chuyên viên Kinh doanh</option>
                  <option value="Chuyên viên Marketing">Chuyên viên Marketing</option>
                  <option value="Trưởng nhóm Kinh doanh">Trưởng nhóm Kinh doanh</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              {/* Office/Branch Filter */}
              <div>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full px-4 py-3 bg-white rounded-2xl border border-brand-brown/10 focus:border-brand-yellow outline-none text-sm transition-all appearance-none cursor-pointer shadow-sm"
                >
                  <option value="Tất cả">Tất cả khu vực làm việc</option>
                  <option value="VP Võ Thị Sáu (CS1)">VP Võ Thị Sáu (Cơ sở 1)</option>
                  <option value="VP Chí Linh (CS2)">VP Chí Linh (Cơ sở 2)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            {filteredCandidates.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-[#fcf8f2] rounded-full flex items-center justify-center text-brand-yellow">
                  <AlertCircle size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-brand-brown">Không tìm thấy ứng viên hợp lệ</h3>
                  <p className="text-sm text-brand-brown-light">Hãy thử thay đổi từ khóa tìm kiếm hoặc lọc danh sách vị trí khác.</p>
                </div>
              </div>
            ) : (
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-brand-gray/30 border-b border-brand-brown/5">
                    <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-[#a88d6c]">Họ và tên / Ngày nộp</th>
                    <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-[#a88d6c]">Thông tin liên hệ</th>
                    <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-[#a88d6c]">Vị trí ứng tuyển</th>
                    <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-[#a88d6c]">Khu vực đăng ký</th>
                    <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-[#a88d6c]">Kinh nghiệm</th>
                    <th className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-[#a88d6c] text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-brown/5">
                  {filteredCandidates.map((candidate) => (
                    <tr 
                      key={candidate.id} 
                      className="hover:bg-[#fefcf9] transition-colors group cursor-pointer"
                      onClick={() => setSelectedCandidate(candidate)}
                    >
                      {/* Name and Date */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <div className="font-extrabold text-brand-brown text-base group-hover:text-brand-yellow transition-colors flex items-center gap-1.5">
                          {candidate.fullName}
                          {candidate.cvName && (
                            <Paperclip size={13} className="text-emerald-600 shrink-0" title={`Đính kèm tệp CV: ${candidate.cvName}`} />
                          )}
                        </div>
                        <div className="text-[10px] text-brand-brown/40 flex items-center gap-1.5 mt-1">
                          <Calendar size={11} />
                          {new Date(candidate.createdAt).toLocaleString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="px-6 py-4.5">
                        <div className="text-xs font-semibold text-brand-brown flex items-center gap-1.5">
                          <Phone size={12} className="text-brand-yellow shrink-0" />
                          {candidate.phone}
                        </div>
                        <div className="text-xs text-brand-brown-light mt-1 flex items-center gap-1.5">
                          <Mail size={12} className="text-brand-brown/30 shrink-0" />
                          {candidate.email}
                        </div>
                      </td>

                      {/* Position Applied */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <span className={`inline-block px-3 py-1 font-bold text-xs rounded-full border ${getPositionBadgeClass(candidate.position)}`}>
                          {candidate.position}
                        </span>
                      </td>

                      {/* Branch Area */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-brand-brown font-semibold">
                          <MapPin size={12} className="text-brand-yellow" />
                          {candidate.branch}
                        </div>
                      </td>

                      {/* Experience Info */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <div className="text-xs text-brand-brown font-semibold bg-brand-gray px-2.5 py-1 rounded-lg inline-block">
                          {candidate.experience}
                        </div>
                      </td>

                      {/* Table Actions */}
                      <td className="px-6 py-4.5 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedCandidate(candidate)}
                            className="p-1 text-brand-brown hover:text-brand-yellow font-bold text-xs flex items-center gap-1 transition-colors"
                            title="Xem chi tiết"
                          >
                            <span className="p-1.5 bg-brand-gray group-hover:bg-brand-yellow/10 rounded-xl transition-all">
                              <Eye size={16} />
                            </span>
                          </button>
                          
                          <div className="relative">
                            {showDeleteConfirmId === candidate.id ? (
                              <div className="absolute right-0 bottom-full mb-1 bg-white p-2.5 rounded-xl border border-rose-100 shadow-xl z-10 flex gap-2 items-center text-xs whitespace-nowrap">
                                <span className="text-rose-600 font-bold">Xác nhận xóa?</span>
                                <button 
                                  onClick={() => handleDelete(candidate.id)}
                                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg"
                                >
                                  Xóa
                                </button>
                                <button 
                                  onClick={() => setShowDeleteConfirmId(null)}
                                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg"
                                >
                                  Hủy
                                </button>
                              </div>
                            ) : null}
                            <button
                              onClick={() => setShowDeleteConfirmId(candidate.id)}
                              className="p-1.5 text-brand-brown/40 hover:text-rose-600 bg-brand-gray hover:bg-rose-50 rounded-xl transition-all"
                              title="Xóa ứng viên"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Candidate Details Slide-Over Panel */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop screen */}
          <div 
            className="absolute inset-0 bg-[#3d240f]/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedCandidate(null)}
          ></div>

          {/* Panel content */}
          <div className="relative w-full max-w-lg bg-[#fcf8f2] min-h-screen text-brand-brown shadow-2xl flex flex-col z-10 border-l border-brand-brown/5">
            {/* Slide Header */}
            <div className="p-6 bg-white border-b border-brand-brown/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#a88d6c]">Hồ sơ chi tiết</span>
                <h3 className="text-xl font-black mt-0.5">{selectedCandidate.fullName}</h3>
              </div>
              <button 
                onClick={() => setSelectedCandidate(null)}
                className="p-2 bg-brand-gray hover:bg-brand-yellow/10 rounded-xl transition-all text-brand-brown-light hover:text-brand-brown"
              >
                <X size={18} />
              </button>
            </div>

            {/* Slide Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Position and Timing banner */}
              <div className="bg-white rounded-2xl p-5 border border-brand-brown/5 shadow-subtle flex flex-wrap gap-4 items-center justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-brand-brown/40 mb-1">Vị trí tương tác</div>
                  <span className={`inline-block px-3 py-1 font-bold text-xs rounded-full border ${getPositionBadgeClass(selectedCandidate.position)}`}>
                    {selectedCandidate.position}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black uppercase tracking-widest text-brand-brown/40 mb-1">Ngày đăng ký</div>
                  <div className="text-xs font-semibold flex items-center justify-end gap-1">
                    <Calendar size={12} className="text-brand-yellow" />
                    {new Date(selectedCandidate.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
                    })}
                  </div>
                </div>
              </div>

              {/* Information Blocks */}
              <div className="bg-white rounded-[1.5rem] border border-brand-brown/5 shadow-subtle p-6 space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#a88d6c] border-b border-brand-brown/5 pb-2">Thông tin liên lạc</h4>
                
                <div className="grid grid-cols-1 gap-4">
                  {/* Phone */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-brand-gray rounded-xl flex items-center justify-center text-brand-yellow shrink-0">
                      <Phone size={16} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-brand-brown/40 uppercase">Số điện thoại</div>
                      <a href={`tel:${selectedCandidate.phone}`} className="text-sm font-black hover:text-brand-yellow transition-colors">
                        {selectedCandidate.phone}
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-brand-gray rounded-xl flex items-center justify-center text-brand-yellow shrink-0">
                      <Mail size={16} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-brand-brown/40 uppercase">Địa chỉ Email</div>
                      <a href={`mailto:${selectedCandidate.email}`} className="text-sm font-black hover:text-brand-yellow transition-colors break-all">
                        {selectedCandidate.email}
                      </a>
                    </div>
                  </div>

                  {/* Branch Working Site */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-brand-gray rounded-xl flex items-center justify-center text-brand-yellow shrink-0">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-brand-brown/40 uppercase">Văn phòng làm việc</div>
                      <div className="text-sm font-black">{selectedCandidate.branch}</div>
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-brand-gray rounded-xl flex items-center justify-center text-brand-yellow shrink-0">
                      <Briefcase size={16} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-brand-brown/40 uppercase">Kinh nghiệm phân khúc</div>
                      <div className="text-sm font-black">{selectedCandidate.experience}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Candidate CV Attachment block */}
              <div className="bg-white rounded-[1.5rem] border border-brand-brown/5 shadow-subtle p-6 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#a88d6c] border-b border-brand-brown/5 pb-2">Hồ sơ CV đính kèm</h4>
                {selectedCandidate.cvName && selectedCandidate.cvData ? (
                  <div className="flex items-center justify-between p-4 bg-emerald-50/40 border border-emerald-500/20 rounded-2xl">
                    <div className="flex items-center gap-3 overflow-hidden mr-2">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                        <FileText size={18} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-black text-brand-brown truncate" title={selectedCandidate.cvName}>
                          {selectedCandidate.cvName}
                        </p>
                        <p className="text-[10px] text-emerald-600 font-extrabold tracking-wider uppercase mt-0.5">
                          Tập tin ngoại tuyến
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadCV(selectedCandidate)}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.02] text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-emerald-800/10 shrink-0 cursor-pointer"
                    >
                      <Download size={13} /> TẢI VỀ
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-brand-gray text-brand-brown/50 rounded-2xl text-xs font-bold flex items-center gap-2">
                    <Paperclip size={14} className="text-brand-brown/30" />
                    Không có tài liệu CV đính kèm cho ứng viên này.
                  </div>
                )}
              </div>

              {/* Candidate Letter/Message block */}
              <div className="bg-white rounded-[1.5rem] border border-brand-brown/5 shadow-subtle p-6 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#a88d6c] border-b border-brand-brown/5 pb-2">Ghi chú / Lời nhắn</h4>
                <div className="text-sm bg-[#faf4ec] text-brand-brown/80 p-4 rounded-xl leading-relaxed italic border-l-4 border-brand-yellow">
                  {selectedCandidate.note || "Ứng viên không để lại lời nhắn."}
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="p-6 bg-white border-t border-brand-brown/5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <a 
                  href={`tel:${selectedCandidate.phone}`}
                  className="w-full py-3.5 bg-brand-yellow hover:bg-brand-yellow-hover text-brand-brown font-black rounded-xl text-center flex items-center justify-center gap-1.5 shadow-md shadow-brand-yellow/15 text-sm transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Phone size={15} /> Gọi ứng tuyển
                </a>
                <a 
                  href={`mailto:${selectedCandidate.email}`}
                  className="w-full py-3.5 bg-brand-gray hover:bg-brand-brown hover:text-white text-brand-brown font-black rounded-xl text-center flex items-center justify-center gap-1.5 shadow-inner text-sm transition-all hover:scale-[1.02] active:scale-95 border border-brand-brown/10"
                >
                  <Mail size={15} /> Gửi Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
