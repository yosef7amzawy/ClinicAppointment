import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import DemoBanner from "../components/DemoBanner";
import { useDemoMode } from "../demo/demoStore";
import "../styles/login.css";
import { API_BASE_URL } from "../config";
function Login() {
  const isDemo = useDemoMode();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("doctor");
  const [error, setError] = useState("");

{/*
  const handleLogin = async () => {
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/Users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "البريد الإلكتروني أو كلمة المرور غير صحيحة");
        return;
      }

      if (data.role !== role) {
        setError("لقد اخترت نوع مستخدم خاطئ");
        return;
      }

      localStorage.setItem("role", "doctor");

      if (data.role === "doctor") {
        navigate("/patients");
      } else if (data.role === "receptionist") {
        navigate("/reception");
      }
    } catch (err) {
      setError("حدث خطأ أثناء تسجيل الدخول");
    }
  //};*/}

  const handleLogin = () => {
  localStorage.setItem("role", "doctor");
  navigate("/patients");
};

  return (
    <div className="login-container">

      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-text">
            <h3>عيادة الباطنة</h3>
            <span>Internal Medicine Clinic</span>
          </div>
          <div className="login-brand-icon">
            <Icon name="stethoscope" size={22} strokeWidth={1.6} />
          </div>
        </div>

        <div className="login-hero">
          <h1>نظام إدارة عيادة متكامل</h1>
          <p>احجز المواعيد، تابع المرضى، وأدر استقبال العيادة من مكان واحد بتجربة احترافية وآمنة.</p>
        </div>

        <div className="login-stats">
          <div className="login-stat">
            <span className="stat-value">24/7</span>
            <span className="stat-label">دعم</span>
          </div>
          <div className="login-stat">
            <span className="stat-value">98%</span>
            <span className="stat-label">رضا</span>
          </div>
          <div className="login-stat">
            <span className="stat-value">1.2k+</span>
            <span className="stat-label">مريض</span>
          </div>
        </div>
      </div>

      <div className="login-right">
        {isDemo && <DemoBanner />}

        <div className="login-header">
          <span className="login-kicker">تسجيل الدخول</span>
          <h2>مرحباً بعودتك</h2>
          <p>سجّل دخولك للوصول إلى لوحة التحكم الخاصة بك.</p>
        </div>

        <div className="form-group">
          <label className="form-label">نوع المستخدم</label>
          <div className="role-selector">
            <button
              type="button"
              className={`role-btn ${role === "doctor" ? "active" : ""}`}
              onClick={() => setRole("doctor")}
              aria-pressed={role === "doctor"}
            >
              <span className="role-icon">
                <Icon name="stethoscope" size={16} />
              </span>
              طبيب
            </button>
            <button
              type="button"
              className={`role-btn ${role === "receptionist" ? "active" : ""}`}
              onClick={() => setRole("receptionist")}
              aria-pressed={role === "receptionist"}
            >
              <span className="role-icon">
                <Icon name="briefcase" size={16} />
              </span>
              موظف استقبال
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="login-email" className="form-label">البريد الإلكتروني</label>
          <input
            id="login-email"
            type="email"
            className="form-input form-input--ltr"
            placeholder="name@clinic.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="login-password" className="form-label">كلمة المرور</label>
          <input
            id="login-password"
            type="password"
            className="form-input form-input--ltr"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <div className="login-error">{error}</div>}

        <button className="login-btn" onClick={handleLogin}>
          تسجيل الدخول
        </button>

        <p className="login-terms">
          بتسجيل الدخول فأنت توافق على شروط الاستخدام وسياسة الخصوصية.
        </p>
      </div>

    </div>
  );
}

export default Login;