import React, { useState } from "react";
import { motion } from "motion/react";
import { ShieldAlert, X, Eye, EyeOff, Mail, Lock, ArrowRight, CornerDownRight } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

interface AdminLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminLogin({ isOpen, onClose, onSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Vui lòng nhập đầy đủ thông tin đăng nhập!");
      return;
    }

    setLoading(true);

    // Normalize comparison: remove spaces and convert to lowercase for usernames, 
    // allow password with spaces (exactly as requested "0931 522 686") or without spaces
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      // 1. Check Super Admin with hardcoded secret
      const isSuperEmail = cleanEmail === "thinhgiadigital@gmail.com";
      const isSuperPass = 
        cleanPassword === "0931 522 686" || 
        cleanPassword === "0931522686";

      if (isSuperEmail && isSuperPass) {
        localStorage.setItem("thinhgia_admin_authenticated", "true");
        localStorage.setItem("thinhgia_admin_email", "thinhgiadigital@gmail.com");
        localStorage.setItem("thinhgia_admin_session_time", Date.now().toString());
        setLoading(false);
        onSuccess();
        return;
      }

      // 2. Check Custom Employees in Cloud Firestore
      const q = query(collection(db, "employees"), where("email", "==", cleanEmail));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const foundDoc = querySnapshot.docs[0];
        const foundEmp = foundDoc.data() as any;
        const expectedPass = foundEmp.password || "123456"; // default fallback

        if (cleanPassword === expectedPass) {
          localStorage.setItem("thinhgia_admin_authenticated", "true");
          localStorage.setItem("thinhgia_admin_email", foundEmp.email);
          localStorage.setItem("thinhgia_admin_session_time", Date.now().toString());
          setLoading(false);
          onSuccess();
          return;
        } else {
          setError("Mật khẩu của tài khoản nhân sự không chính xác!");
          setLoading(false);
          return;
        }
      }

      // If we got here, it's a failure
      setLoading(false);
      if (isSuperEmail) {
        setError("Mật khẩu bảo mật cho tài khoản quản trị tổng không chính xác.");
      } else {
        setError("Tài khoản chưa được phân quyền hoặc mật khẩu không chính xác.");
      }
    } catch (err) {
      console.error("Lỗi xác minh tài khoản nhân sự:", err);
      setLoading(false);
      setError("Đã xảy ra lỗi hệ thống khi kết nối cơ sở dữ liệu. Vui lòng thử lại!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#3d240f]/60 backdrop-blur-md"
      ></motion.div>

      {/* Login Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full max-w-md bg-[#fcf8f2] rounded-[2.5rem] border border-[#a88d6c]/20 shadow-2xl p-8 md:p-10 text-[#5B4333] z-10 overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-brand-gray hover:bg-brand-yellow/10 rounded-full transition-all text-[#7A5A43] hover:text-[#5B4333]"
        >
          <X size={18} />
        </button>

        {/* Decorative corner highlights */}
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-brand-yellow/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-brand-yellow/5 rounded-full blur-2xl pointer-events-none"></div>

        {/* Header Content */}
        <div className="text-center space-y-3 mb-8">
          <div className="flex justify-center">
            <img 
              src="https://thinhgialand.com/wp-content/uploads/2025/12/Group-108-1.webp" 
              alt="Thịnh Gia Land" 
              className="h-12 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight text-[#5B4333]">Cổng Quản Trị Viên</h3>
            <p className="text-xs text-[#7A5A43] font-medium mt-1">Đăng nhập tài khoản điều phối bộ máy tuyển dụng</p>
          </div>
        </div>

        {/* Error alert wrapper */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-start gap-2.5"
          >
            <ShieldAlert size={18} className="text-rose-600 shrink-0 mt-0.5" />
            <span className="text-xs font-bold leading-relaxed">{error}</span>
          </motion.div>
        )}

        {/* Form elements */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* UserName Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-brand-brown-light tracking-widest block pl-1">
              Tên đăng nhập / Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#7A5A43]/50" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập tên đăng nhập..."
                className="w-full pl-11 pr-4 py-3.5 bg-brand-gray border border-transparent focus:border-brand-yellow focus:bg-white text-sm font-bold rounded-2xl outline-none transition-all text-[#5B4333]"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-black uppercase text-brand-brown-light tracking-widest">
                Mật khẩu bảo mật
              </label>
              <span className="text-[9px] font-extrabold text-brand-yellow flex items-center gap-0.5">
                <CornerDownRight size={8} /> Hệ thống mã hóa
              </span>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#7A5A43]/50" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••• ••• •••"
                className="w-full pl-11 pr-12 py-3.5 bg-brand-gray border border-transparent focus:border-brand-yellow focus:bg-white text-sm font-bold rounded-2xl outline-none transition-all text-[#5B4333]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-[#7A5A43]/50 hover:text-brand-yellow transition-all flex items-center justify-center"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Guidelines info */}
          <p className="text-[10px] text-brand-brown-light/60 px-1 leading-normal italic text-center py-2">
            * Mật khẩu bảo mật được định cấu hình riêng cho cấp lãnh đạo tuyển dụng Thịnh Gia Land.
          </p>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-brand-yellow hover:bg-brand-yellow-hover disabled:bg-brand-yellow/60 text-[#3d240f] font-black rounded-2xl shadow-xl shadow-brand-yellow/15 hover:scale-[1.02] active:scale-95 disabled:scale-100 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 text-sm"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-[#3d240f]" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                ĐANG XÁC MINH...
              </span>
            ) : (
              <>
                XÁC NHẬN ĐĂNG NHẬP <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
