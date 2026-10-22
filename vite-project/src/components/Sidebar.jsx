import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import Icon from "./Icon";
import { toggleDemoMode, useDemoMode } from "../demo/demoStore";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isDemo = useDemoMode();
  const isAppointments = location.pathname === "/appointments" || location.pathname === "/";


const handlePatientsPage = () => {
  navigate("/patients");
};


  //const handlePatientsPage = (e) => {
   // const role = localStorage.getItem("role");
    //if (role === "receptionist") {
   //   e.preventDefault();
    //  const msg = document.createElement("div");
     // msg.className = "access-denied-message";
     // msg.innerText = "غير مصرح لك بالدخول لهذه الصفحة";
     // document.body.appendChild(msg);
      //setTimeout(() => msg.remove(), 2500);
     // return;
    //}
   // navigate("/patients");
  //};

  return (
    <div className="sidebar">

      <div>
        <div className="sidebar-brand">
          <div className="sidebar-brand-text">
            <h3>عيادة الباطنة</h3>
            <span>نظام إدارة العيادة</span>
          </div>
          <div className="sidebar-brand-icon">
  <img src={logo} alt="Clinic Logo" className="sidebar-logo" />
          </div>
        </div>

        <p className="sidebar-section-label">القائمة الرئيسية</p>

        <ul>
          <li className={isAppointments ? "active" : ""}>
            <Link to="/appointments">
              <Icon name="calendar" size={16} />
              المواعيد
            </Link>
          </li>
          <li className={location.pathname === "/reception" ? "active" : ""}>
            <Link to="/reception">
              <Icon name="clipboard" size={16} />
              الاستقبال
            </Link>
          </li>
          <li className={`nav-staff ${location.pathname === "/login" ? "active" : ""}`}>
            <Link to="/login">
              <Icon name="lock" size={15} />
              تسجيل الدخول
            </Link>
          </li>
          <li className={location.pathname === "/patients" ? "active" : ""}>
            <Link to="/patients" onClick={handlePatientsPage}>
              <Icon name="users" size={16} />
              المرضى
            </Link>
          </li>
        </ul>

        <button
          type="button"
          className={`demo-toggle sidebar-demo-toggle ${isDemo ? "is-active" : ""}`}
          onClick={toggleDemoMode}
          aria-pressed={isDemo}
        >
          <Icon name={isDemo ? "close" : "sparkle"} size={15} />
          {isDemo ? "إنهاء العرض التجريبي" : "عرض تجريبي"}
        </button>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-footer-info">
          <div className="sidebar-footer-text">
            <h4>د. أحمد محمد الشرقاوي</h4>
            <span>استشاري باطنة</span>
            <span>الأحد - الأربعاء | 10:00 ص - 4:00 م</span>
          </div>
          <div className="sidebar-footer-avatar">
            <Icon name="stethoscope" size={18} />
          </div>
        </div>
      </div>

    </div>
  );
}

export default Sidebar;