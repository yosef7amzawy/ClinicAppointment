import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import PatientPanel from "../components/PatientPanel";
import DemoBanner from "../components/DemoBanner";
import Icon from "../components/Icon";
import "../styles/patients.css";
import "../styles/patientPanel.css";
import { API_BASE_URL } from "../config";
import { getDemoDataset, useDemoMode } from "../demo/demoStore";

const formatAppointments = (result) =>
  result.map((appt) => ({
    id: appt.id,
    patientId: appt.patientId,
    time: appt.time?.substring(0, 5),
    rawDate: new Date(appt.date),
    dayLabel: new Date(appt.date).toLocaleDateString("ar-EG", { weekday: "long" }),
    dateLabel: new Date(appt.date).toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" }),
    dateKey: new Date(appt.date).toISOString().split("T")[0],
    name: appt.patientName || "مريض",
    status: appt.isFinished ? "منتهي" : "دخول",
    isFinished: appt.isFinished,
    phone: appt.phone || "لا يوجد",
    email: appt.email || "لا يوجد",
    isDemo: appt.isDemo === true,
    visits: 1,
    history: [],
    notes: [],
  }));

function Patients() {
  const navigate = useNavigate();
  const isDemo = useDemoMode();
  const [realAppointments, setRealAppointments] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [selectedVisitPatient, setSelectedVisitPatient] = useState(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [medicines, setMedicines] = useState("");
  const [notes, setNotes] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const demoDataset = isDemo ? getDemoDataset() : null;
  const appointments = demoDataset ? formatAppointments(demoDataset.appointments) : realAppointments;
  const panelPatient = selectedPatient?.isDemo === isDemo ? selectedPatient : null;
  const visitPatient = selectedVisitPatient?.isDemo === isDemo ? selectedVisitPatient : null;
  const visitLocked = Boolean(isDemo || selectedVisitPatient?.isDemo);

  // حماية الصفحة
  //useEffect(() => {
   // const role = localStorage.getItem("role");
   // if (role !== "doctor") {
    //  document.body.innerHTML += `<div class="access-denied-message">غير مصرح لك بالدخول لهذه الصفحة</div>`;
     // navigate("/reception");
  //  }
  //}, [navigate]);

  // جلب الحجوزات
  useEffect(() => {
    if (isDemo) return;

    let cancelled = false;

    fetch(`${API_BASE_URL}/appointments`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setRealAppointments(formatAppointments(Array.isArray(data) ? data : []));
        }
      })
      .catch(() => {
        if (!cancelled) setRealAppointments([]);
      });

    return () => {
      cancelled = true;
    };
  }, [isDemo]);

  // تجميع الحجوزات حسب اليوم
  const groupedByDay = appointments.reduce((acc, appt) => {
    if (!acc[appt.dateKey]) acc[appt.dateKey] = { label: appt.dayLabel, date: appt.dateLabel, items: [] };
    acc[appt.dateKey].items.push(appt);
    return acc;
  }, {});
  const sortedDays = Object.entries(groupedByDay).sort(([a], [b]) => a.localeCompare(b));

  const todayKey = new Date().toISOString().split("T")[0];

  // حفظ الكشف
  const saveVisit = async () => {
    if (visitLocked) return;

    const response = await fetch(`${API_BASE_URL}/PatientHistory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_Id: selectedVisitPatient.id,
        patient_Name: selectedVisitPatient.name,
        diagnosis,
        medicines,
        notes,
        visit_Date: new Date(),
      }),
    });

    if (response.ok) {
      await fetch(`${API_BASE_URL}/appointments/${selectedVisitPatient.id}/finish`, { method: "PUT" });

      setRealAppointments((prev) =>
        prev.map((appt) =>
          appt.id === selectedVisitPatient.id ? { ...appt, status: "منتهي", isFinished: true } : appt
        )
      );

      setSuccessMessage("تم حفظ الكشف بنجاح");
      setTimeout(() => setSuccessMessage(""), 3000);
      setShowVisitModal(false);
      setDiagnosis("");
      setMedicines("");
      setNotes("");
    }
  };

  const totalAppointments = appointments.length;
  const finishedAppointments = appointments.filter((a) => a.isFinished).length;
  const pendingAppointments = appointments.filter((a) => !a.isFinished).length;

  return (
    <div className="patients-container" dir="rtl">
      <Sidebar />

      <div className="patients-main">
        <div className="page-shell">
          <DemoBanner />

          {/* Header */}
          <div className="patients-header">
            <p className="patients-subtitle">نظام إدارة العيادة</p>
            <h1 className="patients-title">لوحة تحكم الدكتور</h1>
          </div>

          {/* Stats Row */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon stat-icon--total">
                <Icon name="clipboard" size={19} />
              </div>
              <div className="stat-info">
                <span className="stat-number">{totalAppointments}</span>
                <span className="stat-label">إجمالي الحجوزات</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon--finished">
                <Icon name="check" size={19} />
              </div>
              <div className="stat-info">
                <span className="stat-number">{finishedAppointments}</span>
                <span className="stat-label">مكتملة</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon--pending">
                <Icon name="hourglass" size={19} />
              </div>
              <div className="stat-info">
                <span className="stat-number">{pendingAppointments}</span>
                <span className="stat-label">بانتظار الدخول</span>
              </div>
            </div>
          </div>

          {/* Days Sections */}
          {sortedDays.map(([dateKey, group]) => (
            <div className="day-section" key={dateKey}>
              <div className="day-header">
                <div className="day-header-right">
                  <span className="day-name">{group.label}</span>
                  {dateKey === todayKey && <span className="today-badge">اليوم</span>}
                  <span className="day-full-date">{group.date}</span>
                </div>
                <span className="day-count">{group.items.length} موعد</span>
              </div>

              <div className="day-grid">
                {group.items.map((appt, idx) => (
                  <div
                    className={`appt-row ${appt.isFinished ? "appt-row--finished" : ""}`}
                    key={idx}
                  >
                    <button type="button" className="appt-name" onClick={() => setSelectedPatient(appt)}>
                      <span className="appt-avatar">
                        <Icon name="user" size={15} />
                      </span>
                      <span>{appt.name}</span>
                    </button>
                    <div className="appt-time">
                      <span className="clock-icon">
                        <Icon name="clock" size={14} />
                      </span>
                      <span dir="ltr">{appt.time}</span>
                    </div>
                    {appt.isFinished ? (
                      <button className="btn-finished" disabled>منتهي</button>
                    ) : (
                      <button
                        className="btn-enter"
                        onClick={() => { setSelectedVisitPatient(appt); setShowVisitModal(true); }}
                      >
                        دخول
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Patient Panel */}
      <PatientPanel patient={panelPatient} onClose={() => setSelectedPatient(null)} />

      {/* Visit Modal */}
      {showVisitModal && visitPatient && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h2 className="modal-title">
                <Icon name="stethoscope" size={18} />
                دخول المريض
              </h2>
              <button className="modal-close-x" onClick={() => setShowVisitModal(false)} aria-label="إغلاق">
                <Icon name="close" size={15} />
              </button>
            </div>
            <p className="modal-patient-name">{visitPatient.name}</p>
            {visitLocked && (
              <div className="demo-lock-note">
                وضع تجريبي: حفظ الكشف معطّل ولن تُرسل أي بيانات إلى قاعدة البيانات.
              </div>
            )}
            <div className="modal-fields">
              <div className="field-group">
                <label htmlFor="visit-diagnosis">التشخيص</label>
                <textarea id="visit-diagnosis" placeholder="اكتب التشخيص..." value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} disabled={visitLocked} />
              </div>
              <div className="field-group">
                <label htmlFor="visit-medicines">الأدوية</label>
                <textarea id="visit-medicines" placeholder="اكتب الأدوية..." value={medicines} onChange={(e) => setMedicines(e.target.value)} disabled={visitLocked} />
              </div>
              <div className="field-group">
                <label htmlFor="visit-notes">الملاحظات</label>
                <textarea id="visit-notes" placeholder="اكتب الملاحظات..." value={notes} onChange={(e) => setNotes(e.target.value)} disabled={visitLocked} />
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="btn-save"
                onClick={saveVisit}
                disabled={visitLocked}
                title={visitLocked ? "غير متاح في الوضع التجريبي" : undefined}
              >
                حفظ الكشف
              </button>
              <button className="btn-cancel" onClick={() => setShowVisitModal(false)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {!isDemo && successMessage && (
        <div className="success-toast" role="status">
          <Icon name="check" size={17} />
          {successMessage}
        </div>
      )}
    </div>
  );
}

export default Patients;