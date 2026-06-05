import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  TrendingUp, 
  Award, 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  ChevronRight, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Zap, 
  BarChart3, 
  GraduationCap, 
  Plane, 
  Coffee,
  Menu,
  X,
  Upload,
  ShieldCheck,
  Paperclip,
  FileText
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { Candidate } from "./types";
import AdminDashboard from "./components/AdminDashboard";
import AdminLogin from "./components/AdminLogin";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db, OperationType, handleFirestoreError, ensureAuth, auth } from "./firebase";

const NAV_LINKS = [
  { name: "Giới thiệu", href: "#about" },
  { name: "Tại sao chọn Thịnh Gia", href: "#why-us" },
  { name: "Môi trường", href: "#environment" },
  { name: "Vị trí tuyển dụng", href: "#jobs" },
  { name: "Quy trình", href: "#process" },
];

const STATS = [
  { label: "Thu nhập", value: "Không giới hạn", icon: <TrendingUp className="w-5 h-5" /> },
  { label: "Khách hàng", value: "Data chính chủ", icon: <Users className="w-5 h-5" /> },
  { label: "Học Marketing", value: "Bán hàng hiệu quả", icon: <BarChart3 className="w-5 h-5" /> },
  { label: "Đào tạo", value: "Thực chiến & Bài bản", icon: <Award className="w-5 h-5" /> },
];

const BENEFITS = [
  { 
    title: "Thu nhập hấp dẫn", 
    desc: "Hoa hồng cao nhất thị trường cùng các khoản thưởng nóng hậu hĩnh theo dự án.",
    icon: <Zap className="w-6 h-6 text-brand-yellow" />
  },
  { 
    title: "Data khách hàng", 
    desc: "Hệ thống data khách hàng tiềm năng dồi dào, tỉ lệ chuyển đổi cực cao.",
    icon: <Users className="w-6 h-6 text-brand-yellow" />
  },
  { 
    title: "Đào tạo chuyên sâu", 
    desc: "Chương trình đào tạo từ cơ bản đến nâng cao, dẫn dắt bởi những chuyên gia hàng đầu.",
    icon: <GraduationCap className="w-6 h-6 text-brand-yellow" />
  },
  { 
    title: "Môi trường chuyên nghiệp", 
    desc: "Văn phòng hiện đại, đầy đủ tiện nghi tại trung tâm Vũng Tàu.",
    icon: <MapPin className="w-6 h-6 text-brand-yellow" />
  },
  { 
    title: "Cơ hội thăng tiến", 
    desc: "Lộ trình thăng tiến rõ ràng cho những cá nhân có năng lực và đam mê.",
    icon: <TrendingUp className="w-6 h-6 text-brand-yellow" />
  },
];

const GALLERY = [
  { url: "/src/assets/images/office_training_session_1780026289664.png", title: "Chương trình đào tạo" },
  { url: "/src/assets/images/women_day_celebration_1780026238263.png", title: "Cá nhân xuất sắc" },
  { url: "/src/assets/images/year_end_milestone_1780026320692.png", title: "Tổng kết năm" },
  { url: "/src/assets/images/office_team_collaboration_1780026267119.png", title: "Đại gia đình Thịnh Gia" },
];

const TIMELINE = [
  { year: "2020", title: "Khởi đầu", desc: "Thành lập với đội ngũ nòng cốt đầy nhiệt huyết tại Vũng Tàu." },
  { year: "2022", title: "Bứt phá", desc: "Mở rộng quy mô, trở thành đối tác chiến lược của nhiều dự án lớn." },
  { year: "2024", title: "Vươn tầm", desc: "Khẳng định vị thế đơn vị môi giới bất động sản cao cấp hàng đầu." },
  { year: "2026", title: "Số hóa", desc: "Áp dụng công nghệ hiện đại vào quy trình bán hàng và quản trị." },
];

const POLICIES = [
  { title: "KPI Rõ Ràng", desc: "Hệ thống đánh giá công bằng, minh bạch, tạo động lực phát triển." },
  { title: "Hoa Hồng Cao", desc: "Tỉ lệ chia sẻ lợi nhuận hấp dẫn nhất trong phân khúc cao cấp." },
  { title: "Thưởng Nóng", desc: "Thưởng ngay bằng tiền mặt hoặc hiện vật giá trị khi chốt deal." },
  { title: "Training 1:1", desc: "Cầm tay chỉ việc từ những Best Seller giàu kinh nghiệm nhất." },
  { title: "Du Lịch Hạng Sang", desc: "Tận hưởng những kỳ nghỉ 5 sao trong và ngoài nước." },
  { title: "Team Building", desc: "Hoạt động ngoại khóa đa dạng, gắn kết tinh thần đồng đội." },
];


const JOBS = [
  {
    title: "Chuyên viên Kinh doanh",
    desc: "Tư vấn và phân phối các sản phẩm bất động sản cao cấp tại khu vực Vũng Tàu và TP.HCM.",
    salary: "Thỏa thuận + Hoa hồng",
    tags: ["Sales", "Full-time", "Senior"]
  },
  {
    title: "Chuyên viên Marketing",
    desc: "Xây dựng chiến dịch quảng bá dự án và phát triển thương hiệu công ty trên các nền tảng số.",
    salary: "10tr - 20tr + Thưởng",
    tags: ["Marketing", "Full-time", "Digital"]
  },
  {
    title: "Trưởng nhóm Kinh doanh",
    desc: "Dẫn dắt đội ngũ 5-10 nhân sự, chịu trách nhiệm về doanh số và đào tạo đội ngũ.",
    salary: "Lương cứng cao + % Team",
    tags: ["Management", "Leader", "Expert"]
  }
];

const PROCESS = [
  { title: "Gửi CV", desc: "Ứng tuyển nhanh qua form hoặc email trực tiếp." },
  { title: "Phỏng vấn", desc: "Trò chuyện cùng bộ phận nhân sự và quản lý trực tiếp." },
  { title: "Đào tạo", desc: "Khóa đào tạo hội nhập và kỹ năng thực chiến trong 1 tuần." },
  { title: "Nhận việc", desc: "Chính thức gia nhập đội ngũ tinh anh Thịnh Gia Land." },
];

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("VP Võ Thị Sáu (CS1)");
  const [isAdminView, setIsAdminView] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);

  useEffect(() => {
    // Listen to Firebase Auth state changes as the sole source of authentication
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && !user.isAnonymous) {
        setCurrentAdmin(user);
        setIsAdminView(true);
      } else {
        setCurrentAdmin(null);
        setIsAdminView(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAdminTrigger = () => {
    if (currentAdmin) {
      setIsAdminView(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };
  
  const [registerName, setRegisterName] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPosition, setRegisterPosition] = useState("Chuyên viên Kinh doanh");
  const [registerExperience, setRegisterExperience] = useState("Chưa có kinh nghiệm");
  const [registerNote, setRegisterNote] = useState("");
  const [registerCVName, setRegisterCVName] = useState("");
  const [registerCVData, setRegisterCVData] = useState("");
  const [registerCVFile, setRegisterCVFile] = useState<File | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [timeLeft, setTimeLeft] = useState({
    days: 29,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    let targetTime = localStorage.getItem("thinhgia_countdown_target");
    if (!targetTime) {
      // Set to exactly 29 days from now
      const initialTarget = Date.now() + 29 * 24 * 60 * 60 * 1000;
      localStorage.setItem("thinhgia_countdown_target", initialTarget.toString());
      targetTime = initialTarget.toString();
    }
    
    const calculateTimeLeft = () => {
      const difference = parseInt(targetTime!) - Date.now();
      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);


  const compressImageIfNeeded = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => resolve((event.target?.result as string) || "");
        reader.onerror = () => resolve("");
        reader.readAsDataURL(file);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const MAX_DIM = 1200;
          let width = img.width;
          let height = img.height;
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL("image/jpeg", 0.65);
            resolve(compressed);
          } else {
            resolve((event.target?.result as string) || "");
          }
        };
        img.onerror = () => resolve((event.target?.result as string) || "");
        img.src = (event.target?.result as string) || "";
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  };

  const saveCandidateToFirestore = async (cand: Candidate) => {
    const syncCand = { ...cand };
    const INLINE_CV_MAX_CHARS = 500000; // Khoảng 375KB dữ liệu CV thô

    if (syncCand.cvData && syncCand.cvData.length > INLINE_CV_MAX_CHARS) {
      const dataToChunk = syncCand.cvData;
      delete syncCand.cvData;
      syncCand.hasChunks = true;

      // 1. Lưu hồ sơ ứng viên chính (không có cvData nặng trực tiếp)
      await setDoc(doc(db, "candidates", syncCand.id), syncCand);

      // 2. Chia nhỏ Base64 thành các phân đoạn 500KB
      const chunks: string[] = [];
      let idx = 0;
      while (idx < dataToChunk.length) {
        chunks.push(dataToChunk.substring(idx, idx + INLINE_CV_MAX_CHARS));
        idx += INLINE_CV_MAX_CHARS;
      }

      // 3. Lưu từng mảnh vào subcollection cvChunks
      const chunkPromises = chunks.map((chunkStr, i) => {
        return setDoc(doc(db, "candidates", syncCand.id, "cvChunks", `chunk_${i}`), {
          chunkData: chunkStr,
          index: i,
          createdAt: new Date().toISOString()
        });
      });
      await Promise.all(chunkPromises);
      console.log(`Đã phân tách và lưu CV thành ${chunks.length} phần trên Firestore cho ứng viên: ${syncCand.fullName}`);
    } else {
      // CV nhỏ hơn giới hạn, lưu thông thường trực tiếp trong tài liệu ứng viên
      await setDoc(doc(db, "candidates", syncCand.id), syncCand);
    }
  };

  // Auto-sync unsaved local candidates to cloud Firestore
  useEffect(() => {
    const syncLocalCandidates = async () => {
      try {
        await ensureAuth();
        const localRaw = localStorage.getItem("thinhgia_candidates");
        if (localRaw) {
          const localList = JSON.parse(localRaw) as Candidate[];
          for (const localCand of localList) {
            try {
              await saveCandidateToFirestore(localCand);
              console.log(`Auto-synced candidate application: ${localCand.fullName}`);
            } catch (err) {
              console.warn(`Sync failed for local candidate ${localCand.fullName}:`, err);
            }
          }
        }
      } catch (err) {
        console.error("Candidate auto-sync failed:", err);
      }
    };
    // Sync 2 seconds after loading to make sure initial resources are ready
    const timeout = setTimeout(syncLocalCandidates, 2000);
    return () => clearTimeout(timeout);
  }, []);

  const handleApplyForBranch = (branchName: string) => {
    setSelectedBranch(branchName);
    const element = document.getElementById("apply");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName.trim()) {
      setSubmitError("Vui lòng nhập họ và tên.");
      return;
    }
    if (!registerPhone.trim()) {
      setSubmitError("Vui lòng nhập số điện thoại.");
      return;
    }
    if (!registerEmail.trim()) {
      setSubmitError("Vui lòng nhập địa chỉ email.");
      return;
    }

    const newCandidate: Candidate = {
      id: "cand-" + Date.now(),
      fullName: registerName,
      phone: registerPhone,
      email: registerEmail,
      position: registerPosition,
      branch: selectedBranch,
      experience: registerExperience,
      note: registerNote,
      createdAt: new Date().toISOString(),
      cvName: registerCVName || undefined,
      cvData: registerCVData || undefined,
    };

    // Lưu trữ trực tiếp lên cơ sở dữ liệu Firestore đám đông bằng cơ chế chia nhỏ chunks tự động nếu tệp nặng
    try {
      await ensureAuth();
      await saveCandidateToFirestore(newCandidate);
    } catch (fErr) {
      console.warn("Lưu trữ online gặp lỗi, đang nộp dự phòng qua local storage & email thông báo:", fErr);
    }

    const sendEmailNotification = async (candidate: Candidate) => {
      const accessKey = (import.meta as any).env?.VITE_WEB3FORMS_ACCESS_KEY;
      
      try {
        const formData = new FormData();
        // Web3Forms accepts a verified developer access key to route mail directly. 
        // We use your generated Web3Forms Access Key: 26c27811-d686-45e7-a29c-c46ca680fd2e
        formData.append("access_key", accessKey || "26c27811-d686-45e7-a29c-c46ca680fd2e");
        formData.append("subject", `[ỨNG VIÊN MỚI] - ${candidate.fullName} ứng tuyển vị trí ${candidate.position}`);
        formData.append("from_name", "Tuyển dụng Thịnh Gia Land");
        formData.append("to", "thinhgiadigital@gmail.com");
        
        // Gửi kèm tệp CV thực tế qua Web3Forms để nhà tuyển dụng có thể tải về trực tiếp từ email
        if (registerCVFile) {
          formData.append("attachment", registerCVFile);
        }
        
        const emailContent = `
=== THÔNG TIN ỨNG VIÊN MỚI ĐĂNG KÝ ===
Họ và tên: ${candidate.fullName}
Số điện thoại: ${candidate.phone}
Email: ${candidate.email}
Vị trí ứng tuyển: ${candidate.position}
Chi nhánh mong muốn làm việc: ${candidate.branch}
Kinh nghiệm làm việc: ${candidate.experience}
Ghi chú thêm: ${candidate.note || "(Không có ghi chú)"}
Tên file CV đính kèm: ${candidate.cvName || "(Không đính kèm)"}
Thời gian nộp: ${new Date(candidate.createdAt).toLocaleString("vi-VN")}

--------------------------------------------------
Đây là thông báo tự động từ Hệ thống Tuyển dụng Thịnh Gia Land.
Vui lòng truy cập trang Quản Trị Viên để xem chi tiết thông tin hồ sơ của ứng viên.
        `;
        formData.append("message", emailContent);

        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          body: formData
        });
        const data = await response.json();
        if (data.success) {
          console.log("Đã gửi thư báo nhắc nhở thành công tới thinhgiadigital@gmail.com!");
        } else {
          console.warn("Web3Forms API Response: " + data.message);
        }
      } catch (err) {
        console.error("Lỗi gửi thông báo email:", err);
      }
    };

    try {
      const existingRaw = localStorage.getItem("thinhgia_candidates");
      const currentCandidates: Candidate[] = existingRaw ? JSON.parse(existingRaw) : [];
      const updated = [newCandidate, ...currentCandidates];
      localStorage.setItem("thinhgia_candidates", JSON.stringify(updated));
      
      // Send real automated email notification instantly in the background
      sendEmailNotification(newCandidate);

      setSubmitSuccess(true);
      setSubmitError("");
      
      // Clear form except selections
      setRegisterName("");
      setRegisterPhone("");
      setRegisterEmail("");
      setRegisterNote("");
      setRegisterCVName("");
      setRegisterCVData("");
      setRegisterCVFile(null);

      // Automatically hide success alert in 5s
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (err) {
      console.error(err);
      setSubmitError("Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại!");
    }
  };

  const [isDragActive, setIsDragActive] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setSubmitError("File CV vượt quá kích thước 10MB. Vui lòng chọn file nhẹ hơn!");
        return;
      }
      setSubmitError("");
      setRegisterCVName(file.name);
      setRegisterCVFile(file);
      try {
        const compressedBase64 = await compressImageIfNeeded(file);
        setRegisterCVData(compressedBase64);
      } catch (err) {
        console.warn("Lỗi khi xử lý nén tệp tin:", err);
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setSubmitError("File CV vượt quá kích thước 10MB. Vui lòng chọn file nhẹ hơn!");
        return;
      }
      setSubmitError("");
      setRegisterCVName(file.name);
      setRegisterCVFile(file);
      try {
        const compressedBase64 = await compressImageIfNeeded(file);
        setRegisterCVData(compressedBase64);
      } catch (err) {
        console.warn("Lỗi khi xử lý nén tệp tin:", err);
      }
    }
  };

  const removeAttachedCV = () => {
    setRegisterCVName("");
    setRegisterCVData("");
    setRegisterCVFile(null);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isAdminView) {
    return <AdminDashboard onBack={() => setIsAdminView(false)} />;
  }

  return (
    <div className="min-h-screen font-sans selection:bg-brand-yellow/30">
      {/* Header */}
      <header 
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-white/90 backdrop-blur-lg shadow-sm py-3" : "bg-transparent py-5"
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <a href="#" className="flex items-center">
            <img 
              src="https://thinhgialand.com/wp-content/uploads/2025/12/Group-108-1.webp" 
              alt="Thịnh Gia Land" 
              className="h-10 md:h-12 w-auto"
              referrerPolicy="no-referrer"
            />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                className="text-sm font-medium hover:text-brand-yellow transition-colors"
                style={{ color: scrolled ? "var(--color-brand-brown)" : "var(--color-brand-brown)" }}
              >
                {link.name}
              </a>
            ))}
            <button 
              onClick={handleAdminTrigger}
              className="px-4 py-2 bg-brand-brown/5 hover:bg-brand-yellow/10 border border-brand-brown/10 text-brand-brown rounded-full font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ShieldCheck size={14} className="text-brand-yellow" />
              Đăng nhập
            </button>
            <a 
              href="#apply" 
              className="bg-brand-yellow hover:bg-brand-yellow-hover text-brand-brown px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg shadow-brand-yellow/20 hover:scale-105"
            >
              Ứng tuyển ngay
            </a>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden text-brand-brown"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 w-full bg-white shadow-xl py-6 flex flex-col items-center gap-4 lg:hidden"
            >
              {NAV_LINKS.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href}
                  className="text-base font-semibold text-brand-brown"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  handleAdminTrigger();
                }}
                className="w-[80%] py-3 hover:bg-brand-yellow/10 border border-brand-brown/10 text-brand-brown rounded-full font-bold text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-2"
              >
                <ShieldCheck size={16} className="text-brand-yellow" />
                Đăng nhập
              </button>
              <a 
                href="#apply" 
                className="bg-brand-yellow text-brand-brown px-8 py-3 rounded-full font-bold w-[80%] text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Ứng tuyển ngay
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://odwintravel.vn/wp-content/uploads/2025/11/thap-tam-thang-vung-tau-1.jpg" 
              alt="Tháp Tam Thắng Vũng Tàu" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Soft linear gradient from left (solid brand-gray) to right (fully transparent) to show the original image completely intact on the right */}
            <div className="absolute inset-0 bg-gradient-to-r from-brand-gray via-brand-gray/60 to-transparent"></div>
          </div>

          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2 text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="inline-block px-4 py-1.5 bg-brand-yellow/10 border border-brand-yellow/20 text-brand-yellow text-xs font-bold tracking-widest uppercase rounded-full mb-6">
                    GIA NHẬP ĐỘI NGŨ TINH ANH
                  </span>
                  <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-brand-brown leading-tight mb-6">
                    Gia nhập đội ngũ <br/>
                    <span className="text-brand-yellow">môi giới thế hệ mới</span>
                  </h1>
                  <p className="text-lg text-brand-brown-light max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                    Môi trường chuyên nghiệp – Thu nhập đột phá – Phát triển sự nghiệp bền vững cùng Thịnh Gia Land.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                    <a 
                      href="#apply" 
                      className="w-full sm:w-auto px-8 py-4 bg-brand-yellow hover:bg-brand-yellow-hover text-brand-brown font-extrabold rounded-full shadow-2xl shadow-brand-yellow/30 flex items-center justify-center gap-2 transition-all hover:scale-105"
                    >
                      Ứng tuyển ngay <ChevronRight size={20} />
                    </a>
                    <a 
                      href="#environment" 
                      className="w-full sm:w-auto px-8 py-4 bg-white/80 border border-brand-brown/10 text-brand-brown font-bold rounded-full hover:bg-white transition-all flex items-center justify-center gap-2"
                    >
                      Khám phá môi trường <ArrowUpRight size={20} />
                    </a>
                  </div>
                </motion.div>
              </div>

              <div className="lg:w-1/2 relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative grid grid-cols-2 gap-4 p-4"
                >
                  {STATS.map((stat, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ y: -5 }}
                      className={`glass p-6 rounded-3xl shadow-premium flex flex-col items-start gap-3 ${idx % 2 === 1 ? 'mt-8' : ''}`}
                    >
                      <div className="w-10 h-10 bg-brand-yellow/10 rounded-xl flex items-center justify-center text-brand-yellow">
                        {stat.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-brand-brown-light uppercase tracking-wider mb-1">{stat.label}</div>
                        <div className="text-sm font-extrabold text-brand-brown">{stat.value}</div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Tech light effects */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-tech-blue/20 blur-3xl -z-10 rounded-full animate-pulse"></div>
                  <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-brand-yellow/10 blur-3xl -z-10 rounded-full"></div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Introduction Section */}
        <section id="about" className="py-24 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:w-1/2"
              >
                <div className="relative">
                  <img 
                    src="https://thinhgialand.com/wp-content/uploads/2026/01/dao-tao-cap-nhat-bang-gia-dat-vung-tau-20264.webp" 
                    alt="Workplace" 
                    className="rounded-[2rem] shadow-2xl w-full object-cover aspect-[4/3]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-10 -right-10 bg-brand-brown text-white p-8 rounded-[2rem] shadow-2xl hidden md:block max-w-[280px]">
                    <p className="text-sm italic font-medium">
                      "Chúng tôi không chỉ bán bất động sản, chúng tôi kiến tạo các nhà môi giới chuyên nghiệp."
                    </p>
                    <div className="mt-4 font-bold text-brand-yellow">Thịnh Gia Land Team</div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:w-1/2"
              >
                <h2 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight">
                  Tầm nhìn & Sứ mệnh <br/>
                  <span className="text-brand-yellow">Kiến tạo tương lai</span>
                </h2>
                <div className="space-y-6 text-brand-brown-light">
                  <p className="leading-relaxed">
                    Với định hướng không ngừng đổi mới để phát triển lâu dài, <span className="font-bold text-brand-brown">Thịnh Gia Land</span> quyết tâm từng bước trở thành đơn vị phân phối, phát triển bất động sản chuyên nghiệp hàng đầu Việt Nam và khu vực.
                  </p>
                  <p className="leading-relaxed">
                    Sứ mệnh của chúng tôi là phát triển đội ngũ nhân lực có chuyên môn, nghiệp vụ vững chắc để góp phần xây dựng môi trường kinh doanh bất động sản Vũng Tàu, TP.HCM được chuyên nghiệp hóa, tạo ra những nhà môi giới bất động sản chuyên nghiệp.
                  </p>
                </div>

                <div className="mt-10 grid grid-cols-2 gap-6">
                  <div className="border-l-4 border-brand-yellow pl-4">
                    <div className="text-2xl font-black text-brand-brown">01</div>
                    <div className="text-sm font-bold text-brand-brown-light uppercase tracking-wide">Chuyên nghiệp</div>
                  </div>
                  <div className="border-l-4 border-brand-yellow pl-4">
                    <div className="text-2xl font-black text-brand-brown">02</div>
                    <div className="text-sm font-bold text-brand-brown-light uppercase tracking-wide">Tin cậy</div>
                  </div>
                  <div className="border-l-4 border-brand-yellow pl-4">
                    <div className="text-2xl font-black text-brand-brown">03</div>
                    <div className="text-sm font-bold text-brand-brown-light uppercase tracking-wide">Công nghệ</div>
                  </div>
                  <div className="border-l-4 border-brand-yellow pl-4">
                    <div className="text-2xl font-black text-brand-brown">04</div>
                    <div className="text-sm font-bold text-brand-brown-light uppercase tracking-wide">Đột phá</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Why Join Section */}
        <section id="why-us" className="py-24 bg-brand-gray relative overflow-hidden">
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Tại sao nên gia nhập Thịnh Gia Land?</h2>
                <p className="text-brand-brown-light text-lg">
                  Chúng tôi mang đến một hệ sinh thái toàn diện để bạn có thể bứt phá giới hạn bản thân.
                </p>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {BENEFITS.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-10 rounded-[2.5rem] shadow-premium hover:shadow-2xl transition-all group"
                >
                  <div className="w-14 h-14 bg-brand-yellow/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-yellow group-hover:text-white transition-all duration-300 border border-brand-yellow/10">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-extrabold mb-4 group-hover:text-brand-yellow transition-colors">{item.title}</h3>
                  <p className="text-brand-brown-light leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-yellow/5 blur-3xl -z-0"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-tech-blue/5 blur-3xl -z-0"></div>
        </section>

        {/* Policies Section - Thương hiệu uy tín */}
        <section className="py-24 bg-white border-y border-brand-gray">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="lg:w-1/3">
                <h2 className="text-3xl md:text-4xl font-extrabold text-brand-brown mb-4 tracking-tighter">Đơn vị uy tín</h2>
                <p className="text-brand-brown-light text-sm leading-relaxed mb-6">Thịnh Gia Land tự hào là lựa chọn hàng đầu, đối tác tin cậy trong hành trình phân phối và phát triển các bất động sản phân khúc cao cấp tại Vũng Tàu.</p>
                <div className="space-y-4 hidden lg:block">
                  <div className="flex items-center gap-3 text-sm text-brand-brown font-semibold">
                    <span className="w-2 h-2 rounded-full bg-brand-yellow"></span> Kênh thông tin chính xác nhất
                  </div>
                  <div className="flex items-center gap-3 text-sm text-brand-brown font-semibold">
                    <span className="w-2 h-2 rounded-full bg-brand-yellow"></span> Giải pháp số hóa tiên phong
                  </div>
                </div>
              </div>
              <div className="lg:w-2/3">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="relative overflow-hidden rounded-[2rem] shadow-premium bg-brand-gray border border-brand-brown/5"
                >
                  <img 
                    src="https://thinhgialand.com/wp-content/uploads/2026/04/DJI_20260413141251_0033_D.webp" 
                    alt="Đơn vị uy tín Thịnh Gia Land" 
                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Working Environment Gallery */}
        <section id="environment" className="py-24 bg-white overflow-hidden">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col lg:flex-row justify-between items-stretch gap-8 mb-16">
              <div className="lg:w-1/2 flex flex-col justify-center">
                <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">Môi trường làm việc <br/> <span className="text-brand-yellow">Đầy cảm hứng</span></h2>
                <p className="text-brand-brown-light text-lg">
                  Nơi mỗi ngày làm việc đều là một hành trình thú vị. Chúng tôi xây dựng văn hóa công ty dựa trên sự sẻ chia và phát triển chung.
                </p>
              </div>
              <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Văn phòng Võ Thị Sáu */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="relative rounded-[2rem] overflow-hidden shadow-premium group min-h-[300px] cursor-pointer"
                  onClick={() => handleApplyForBranch("VP Võ Thị Sáu (CS1)")}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80" 
                    alt="Văn phòng Võ Thị Sáu" 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-115 transition-transform duration-1000"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-brown via-brand-brown/50 to-transparent flex flex-col justify-end p-6">
                    <span className="inline-block self-start px-2.5 py-1 bg-brand-yellow text-brand-brown text-[10px] font-black tracking-wider uppercase rounded-full mb-2">CS1: Võ Thị Sáu</span>
                    <h4 className="text-white font-black text-xl mb-1">VP Võ Thị Sáu</h4>
                    <p className="text-white/80 text-xs flex items-center gap-1 mb-3">
                      <MapPin size={12} className="text-brand-yellow shrink-0" /> 90 Võ Thị Sáu, P. Vũng Tàu, TP. HCM
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyForBranch("VP Võ Thị Sáu (CS1)");
                      }}
                      className="px-4 py-2.5 bg-brand-yellow hover:bg-white text-brand-brown hover:scale-105 active:scale-95 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 self-start transition-all shadow-md"
                    >
                      Nộp hồ sơ <ArrowUpRight size={14} />
                    </button>
                  </div>
                </motion.div>

                {/* Văn phòng Chí Linh */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="relative rounded-[2rem] overflow-hidden shadow-premium group min-h-[300px] cursor-pointer"
                  onClick={() => handleApplyForBranch("VP Chí Linh (CS2)")}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80" 
                    alt="Văn phòng Chí Linh" 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-115 transition-transform duration-1000"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-brown via-brand-brown/50 to-transparent flex flex-col justify-end p-6">
                    <span className="inline-block self-start px-2.5 py-1 bg-brand-yellow text-brand-brown text-[10px] font-black tracking-wider uppercase rounded-full mb-2">CS2: Chí Linh</span>
                    <h4 className="text-white font-black text-xl mb-1">VP Chí Linh</h4>
                    <p className="text-white/80 text-xs flex items-center gap-1 mb-3">
                      <MapPin size={12} className="text-brand-yellow shrink-0" /> KDT Chí Linh, P. Rạch Dừa, TP. HCM
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyForBranch("VP Chí Linh (CS2)");
                      }}
                      className="px-4 py-2.5 bg-brand-yellow hover:bg-white text-brand-brown hover:scale-105 active:scale-95 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 self-start transition-all shadow-md"
                    >
                      Nộp hồ sơ <ArrowUpRight size={14} />
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {GALLERY.map((img, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className={`relative overflow-hidden rounded-3xl group cursor-pointer shadow-premium ${
                    idx === 0 ? "md:col-span-2 md:row-span-2" : ""
                  } ${idx % 3 === 1 ? "md:row-span-2" : ""}`}
                >
                  <img 
                    src={img.url} 
                    alt={img.title} 
                    className="w-full h-full object-cover aspect-square md:aspect-auto group-hover:scale-110 transition-transform duration-1000"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-brown/90 via-brand-brown/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8">
                    <div>
                      <p className="text-brand-yellow font-black uppercase text-[10px] tracking-widest mb-1">Thịnh Gia Activities</p>
                      <p className="text-white font-bold text-xl">{img.title}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Policies Section */}
        <section className="py-24 bg-brand-brown text-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-5xl font-extrabold mb-8 tracking-tight">Quyền lợi & <br/> <span className="text-brand-yellow">Chính sách đãi ngộ</span></h2>
                <div className="grid sm:grid-cols-2 gap-8">
                  {POLICIES.map((policy, idx) => (
                    <div key={idx} className="space-y-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={24} className="text-brand-yellow shrink-0" />
                        <h4 className="font-bold text-lg">{policy.title}</h4>
                      </div>
                      <p className="text-white/60 text-sm leading-relaxed">{policy.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <img 
                  src="https://thinhgialand.com/wp-content/uploads/2026/01/TONG-KET-NAM-2025-21.webp" 
                  alt="Bonus & Rewards" 
                  className="rounded-[3rem] shadow-2xl relative z-10 w-full object-cover aspect-[4/3] md:aspect-auto"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -top-10 -right-10 bg-brand-yellow text-brand-brown p-10 rounded-full font-black text-2xl animate-float z-20">
                  +100%
                </div>
                <div className="absolute inset-0 bg-brand-yellow/20 blur-[100px] -z-10 rounded-full"></div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Job Positions */}
        <section id="jobs" className="py-24 bg-brand-gray">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-6 italic">Sẵn sàng gia nhập?</h2>
              <p className="text-brand-brown-light text-lg">
                Các vị trí đang chào đón những ứng viên tài năng nhất.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {JOBS.map((job, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: idx % 3 === 0 ? -20 : idx % 3 === 2 ? 20 : 0, y: 20 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-8 rounded-[3rem] border border-transparent hover:border-brand-yellow transition-all flex flex-col justify-between group shadow-sm hover:shadow-xl"
                >
                  <div>
                    <div className="flex gap-2 mb-6 flex-wrap">
                      {job.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-brand-gray text-[10px] uppercase font-black tracking-widest text-brand-brown-light rounded-full border border-brand-brown/5">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-2xl font-extrabold mb-4 group-hover:text-brand-yellow transition-colors">{job.title}</h3>
                    <p className="text-brand-brown-light mb-8 leading-relaxed">
                      {job.desc}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto pt-8 border-t border-brand-gray">
                    <div>
                      <div className="text-[10px] font-black uppercase text-brand-brown-light mb-1">Thỏa thuận</div>
                      <div className="text-brand-brown font-bold">{job.salary}</div>
                    </div>
                    <a 
                      href="#apply" 
                      className="w-12 h-12 bg-brand-yellow rounded-2xl flex items-center justify-center text-brand-brown shadow-lg shadow-brand-yellow/20 hover:scale-110 transition-transform"
                    >
                      <ArrowUpRight size={20} />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Recruitment Process */}
        <section id="process" className="py-24 bg-brand-brown text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "40px 40px" }}></div>
          </div>

          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Quy trình ứng tuyển</h2>
              <p className="text-white/60">Đơn giản - Minh bạch - Chuyên nghiệp</p>
            </div>

            <div className="grid md:grid-cols-4 gap-4 relative">
              {/* Connector line for desktop */}
              <div className="hidden md:block absolute top-10 left-0 w-full h-0.5 bg-white/10 -z-10"></div>
              
              {PROCESS.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex flex-col items-center text-center p-6"
                >
                  <div className="w-20 h-20 bg-brand-yellow text-brand-brown rounded-3xl flex items-center justify-center text-3xl font-black mb-8 shadow-2xl shadow-brand-yellow/20 relative">
                    {idx + 1}
                    <div className="absolute inset-0 rounded-3xl bg-white/20 animate-ping opacity-20"></div>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section id="apply" className="py-24 bg-brand-gray relative overflow-hidden">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-[4rem] shadow-premium overflow-hidden flex flex-col lg:flex-row">
                <div className="lg:w-2/5 bg-brand-brown p-12 text-white flex flex-col justify-between">
                  <div>
                    <h2 className="text-3xl font-extrabold mb-6">Kết nối ngay <br/> Với bộ phận HR</h2>
                    <p className="text-white/70 mb-10">Để lại thông tin, đội ngũ nhân sự sẽ liên hệ với bạn trong vòng 24h làm việc.</p>
                    
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                          <Phone size={18} className="text-brand-yellow" />
                        </div>
                        <div>
                          <p className="text-xs text-white/50 font-bold uppercase tracking-widest">Hotline tuyển dụng</p>
                          <p className="font-bold">0931 522 686</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                          <Mail size={18} className="text-brand-yellow" />
                        </div>
                        <div>
                          <p className="text-xs text-white/50 font-bold uppercase tracking-widest">Email tiếp nhận CV</p>
                          <p className="font-bold">info@thinhgialand.com</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                          <MapPin size={18} className="text-brand-yellow" />
                        </div>
                        <div>
                          <p className="text-xs text-white/50 font-bold uppercase tracking-widest">Địa chỉ làm việc chính</p>
                          <p className="font-bold">90 Võ Thị Sáu, P. Vũng Tàu, TP. HCM</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Countdown Banner */}
                    <div className="mt-10 pt-8 border-t border-white/10">
                      <div className="flex items-center gap-2 mb-4">
                        <Clock size={16} className="text-brand-yellow animate-pulse" />
                        <span className="text-xs font-extrabold uppercase tracking-widest text-brand-yellow">Thời gian đăng ký còn lại</span>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2.5">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 flex flex-col items-center justify-center backdrop-blur-sm">
                          <span className="text-2xl font-black text-brand-yellow font-mono">{String(timeLeft.days).padStart(2, '0')}</span>
                          <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest mt-1">Ngày</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 flex flex-col items-center justify-center backdrop-blur-sm">
                          <span className="text-2xl font-black text-brand-yellow font-mono">{String(timeLeft.hours).padStart(2, '0')}</span>
                          <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest mt-1">Giờ</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 flex flex-col items-center justify-center backdrop-blur-sm">
                          <span className="text-2xl font-black text-brand-yellow font-mono">{String(timeLeft.minutes).padStart(2, '0')}</span>
                          <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest mt-1">Phút</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 flex flex-col items-center justify-center backdrop-blur-sm">
                          <span className="text-2xl font-black text-[#FF8E8E] font-mono">{String(timeLeft.seconds).padStart(2, '0')}</span>
                          <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest mt-1">Giây</span>
                        </div>
                      </div>
                      
                      <p className="text-[11px] text-white/50 font-semibold mt-3 flex items-center gap-2">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Đang nhận hồ sơ ứng tuyển trực tuyến đợt này
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-12">
                    <img 
                      src="https://thinhgialand.com/wp-content/uploads/2025/12/Group-108-1.webp" 
                      alt="Logo" 
                      className="h-10 opacity-50 grayscale transition-all hover:grayscale-0"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                <div className="lg:w-3/5 p-12 lg:p-16">
                  {submitSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mb-8 p-6 bg-emerald-50 border border-emerald-200 text-[#107c41] rounded-3xl flex items-start gap-3 shadow-lg"
                    >
                      <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5 animate-bounce" />
                      <div>
                        <h4 className="font-extrabold text-[#0e6c38] text-base mb-1">Đăng ký ứng tuyển thành công!</h4>
                        <p className="text-xs text-[#0e6c38]/80 leading-relaxed font-medium">Hồ sơ đã được lưu, đồng thời hệ thống đã gửi email thông báo nhắc nhở đến ban quản trị (thinhgiadigital@gmail.com). Chúng tôi sẽ liên hệ lại sớm nhất!</p>
                      </div>
                    </motion.div>
                  )}

                  {submitError && (
                    <div className="mb-8 p-6 bg-rose-50 border border-rose-200 text-rose-800 rounded-3xl flex items-start gap-2">
                      <div className="text-sm font-semibold">{submitError}</div>
                    </div>
                  )}

                  <form onSubmit={handleRegisterSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-brand-brown-light tracking-widest">Họ và tên</label>
                        <input 
                          type="text" 
                          required
                          value={registerName}
                          onChange={(e) => setRegisterName(e.target.value)}
                          placeholder="Nguyễn Văn A" 
                          className="w-full px-6 py-4 bg-brand-gray rounded-2xl border border-transparent focus:border-brand-yellow focus:bg-white outline-none font-bold transition-all text-brand-brown"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-brand-brown-light tracking-widest">Số điện thoại</label>
                        <input 
                          type="tel" 
                          required
                          value={registerPhone}
                          onChange={(e) => setRegisterPhone(e.target.value)}
                          placeholder="09xx xxx xxx" 
                          className="w-full px-6 py-4 bg-brand-gray rounded-2xl border border-transparent focus:border-brand-yellow focus:bg-white outline-none font-bold transition-all text-brand-brown"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-brand-brown-light tracking-widest">Địa chỉ Email</label>
                        <input 
                          type="email" 
                          required
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          placeholder="example@gmail.com" 
                          className="w-full px-6 py-4 bg-brand-gray rounded-2xl border border-transparent focus:border-brand-yellow focus:bg-white outline-none font-bold transition-all text-brand-brown"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-brand-brown-light tracking-widest">Kinh nghiệm làm việc</label>
                        <select 
                          value={registerExperience}
                          onChange={(e) => setRegisterExperience(e.target.value)}
                          className="w-full px-6 py-4 bg-brand-gray rounded-2xl border border-transparent focus:border-brand-yellow focus:bg-white outline-none font-bold transition-all appearance-none cursor-pointer text-brand-brown"
                        >
                          <option value="Chưa có kinh nghiệm">Chưa có kinh nghiệm</option>
                          <option value="Dưới 1 năm">Dưới 1 năm kinh nghiệm</option>
                          <option value="1-2 năm">1 - 2 năm kinh nghiệm</option>
                          <option value="Trên 2 năm">Trên 2 năm kinh nghiệm</option>
                          <option value="Trên 5 năm">Trên 5 năm kinh nghiệm</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-brand-brown-light tracking-widest">Vị trí ứng tuyển</label>
                        <select 
                          value={registerPosition}
                          onChange={(e) => setRegisterPosition(e.target.value)}
                          className="w-full px-6 py-4 bg-brand-gray rounded-2xl border border-transparent focus:border-brand-yellow focus:bg-white outline-none font-bold transition-all appearance-none cursor-pointer text-brand-brown"
                        >
                          <option value="Chuyên viên Kinh doanh">Chuyên viên Kinh doanh</option>
                          <option value="Chuyên viên Marketing">Chuyên viên Marketing</option>
                          <option value="Trưởng nhóm Kinh doanh">Trưởng nhóm Kinh doanh</option>
                          <option value="Khác">Khác / Bộ phận hỗ trợ</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-brand-brown-light tracking-widest">Văn phòng làm việc mong muốn</label>
                        <select 
                          value={selectedBranch}
                          onChange={(e) => setSelectedBranch(e.target.value)}
                          className="w-full px-6 py-4 bg-brand-gray rounded-2xl border border-transparent focus:border-brand-yellow focus:bg-white outline-none font-bold transition-all appearance-none cursor-pointer text-brand-brown"
                        >
                          <option value="VP Võ Thị Sáu (CS1)">VP Võ Thị Sáu (Cơ sở 1)</option>
                          <option value="VP Chí Linh (CS2)">VP Chí Linh (Cơ sở 2)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-brand-brown-light tracking-widest">Lời nhắn / Ghi chú thêm</label>
                      <textarea 
                        value={registerNote}
                        onChange={(e) => setRegisterNote(e.target.value)}
                        placeholder="Hãy chia sẻ thêm về mong muốn của bạn hoặc đặt câu hỏi cho hội đồng tuyển dụng..." 
                        rows={4}
                        className="w-full px-6 py-4 bg-brand-gray rounded-2xl border border-transparent focus:border-brand-yellow focus:bg-white outline-none font-bold transition-all text-brand-brown resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-brand-brown-light tracking-widest block pl-1">
                        Hồ sơ CV của bạn
                      </label>
                      <div className="w-full p-6 md:p-8 bg-brand-gray border border-brand-brown/10 rounded-3xl flex flex-col items-center justify-center text-center gap-3 shadow-inner">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-brown shadow-sm animate-bounce">
                          <Mail size={22} className="text-brand-yellow" />
                        </div>
                        <p className="text-sm font-bold text-brand-brown leading-relaxed max-w-sm">
                          Bạn ơi đừng quên nộp CV qua Email:<br />
                          <a 
                            href="mailto:info@thinhgialand.com" 
                            className="text-brand-yellow hover:text-brand-brown hover:underline font-black text-base md:text-lg block mt-1 transition-colors"
                          >
                            info@thinhgialand.com
                          </a>
                          <span className="text-[10px] text-brand-brown/40 block mt-1 font-semibold uppercase tracking-wider">
                            Tiêu đề gợi ý: [Họ Tên] - [Vị trí ứng tuyển]
                          </span>
                        </p>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-5 bg-brand-yellow hover:bg-brand-yellow-hover text-brand-brown font-black rounded-3xl shadow-xl shadow-brand-yellow/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Gửi thông tin ứng tuyển <ArrowUpRight size={20} />
                    </button>
                    
                    <p className="text-center text-[10px] text-brand-brown/40 px-8">
                      Bằng cách nhấn nút gửi, bạn đồng ý với các chính sách bảo mật thông tin ứng viên của Thịnh Gia Land.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="h-[450px] w-full bg-brand-gray grayscale-[0.5] hover:grayscale-0 transition-all duration-700">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d37571.671100833315!2d107.07798128640613!3d10.358807108605415!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31756fe85e873a55%3A0x58bf4754fb5e993c!2zQ8O0bmcgVHkgQ-G7lSBQaOG6p24gVGjhu4tuaCBHaWEgTGFuZA!5e1!3m2!1svi!2s!4v1778747857307!5m2!1svi!2s" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={true} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Thịnh Gia Land Map"
          ></iframe>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-brand-brown text-white py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-4 gap-12 mb-16">
            <div className="lg:col-span-2">
              <img 
                src="https://thinhgialand.com/wp-content/uploads/2025/12/Group-108-1.webp" 
                alt="Logo" 
                className="h-12 w-auto mb-8 grayscale brightness-[10]"
                referrerPolicy="no-referrer"
              />
              <h3 className="text-2xl font-extrabold mb-6">CÔNG TY CỔ PHẦN THỊNH GIA LAND</h3>
              <p className="text-white/60 max-w-sm mb-8 leading-relaxed">
                Đơn vị phân phối và phát triển bất động sản chuyên nghiệp hàng đầu tại Vũng Tàu. Chúng tôi không ngừng đổi mới để mang lại giá trị thực cho khách hàng và đối tác.
              </p>
              <div className="flex gap-4">
                <a href="https://www.facebook.com/thinhgialand/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-brand-yellow hover:text-brand-brown transition-all">
                  <Facebook size={20} />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-brand-yellow font-black uppercase text-xs tracking-widest mb-8">Liên kết nhanh</h4>
              <ul className="space-y-4 text-white/70">
                {NAV_LINKS.map(link => (
                  <li key={link.name}>
                    <a href={link.href} className="hover:text-brand-yellow transition-colors flex items-center gap-2">
                      <ChevronRight size={14} /> {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-brand-yellow font-black uppercase text-xs tracking-widest mb-8">Thông tin liên hệ</h4>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <MapPin size={20} className="text-brand-yellow shrink-0" />
                  <span className="text-white/70 text-sm">CS1: 90 Võ Thị Sáu, P. Vũng Tàu, TP. HCM <br/> CS2: KDT Chí Linh, P. Rạch Dừa, TP. HCM</span>
                </li>
                <li className="flex gap-3">
                  <Phone size={20} className="text-brand-yellow shrink-0" />
                  <span className="text-white/70 text-sm">0931 522 686</span>
                </li>
                <li className="flex gap-3">
                  <Mail size={20} className="text-brand-yellow shrink-0" />
                  <span className="text-white/70 text-sm">info@thinhgialand.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-white/40 text-xs">
              © 2026 Thịnh Gia Land. All rights reserved. Designed for recruitment excellence.
            </p>
            <div className="flex gap-6 text-white/40 text-[10px] font-bold uppercase tracking-widest">
              <a href="#" className="hover:text-brand-yellow">Chính sách bảo mật</a>
              <a href="#" className="hover:text-brand-yellow">Điều khoản ứng tuyển</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Sticky Mobile CTA */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: scrolled ? 0 : 100 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:hidden z-50 pointer-events-none"
      >
        <a 
          href="#apply" 
          className="pointer-events-auto w-full py-4 bg-brand-yellow text-brand-brown font-black rounded-3xl shadow-2xl shadow-brand-yellow/50 flex items-center justify-center gap-2 text-sm uppercase tracking-wider glow-yellow"
        >
          Ứng tuyển ngay <ArrowUpRight size={18} />
        </a>
      </motion.div>

      {/* Admin Login Modal */}
      <AnimatePresence>
        {isAdminLoginOpen && (
          <AdminLogin
            isOpen={isAdminLoginOpen}
            onClose={() => setIsAdminLoginOpen(false)}
            onSuccess={() => {
              setIsAdminLoginOpen(false);
              setIsAdminView(true);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
