import { useEffect, useState } from "react";
import Icon from "./Icon";
import { API_BASE_URL } from "../config";
import { getDemoHistoryForPatient, useDemoMode } from "../demo/demoStore";

function PatientPanel({ patient, onClose }) {
  const isDemo = useDemoMode();
  const isDemoPatient = isDemo || patient?.isDemo === true;
  const [historyState, setHistoryState] = useState({ patientName: "", items: [] });
  const demoHistory =
    isDemoPatient && patient
      ? getDemoHistoryForPatient(patient.patientId, patient.name)
      : [];
  const history = isDemoPatient
    ? demoHistory
    : historyState.patientName !== patient?.name
      ? []
      : historyState.items;

  useEffect(() => {
    if (!patient || isDemoPatient) return;

    let cancelled = false;

    fetch(`${API_BASE_URL}/PatientHistory/${encodeURIComponent(patient.name)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setHistoryState({
            patientName: patient.name,
            items: Array.isArray(data) ? data : [],
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHistoryState({ patientName: patient.name, items: [] });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [patient, isDemoPatient]);

  if (!patient) return null;

  const dayName = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("ar-EG", { weekday: "long" });
  };

  const fullDate = (dateStr) => {
    if (!dateStr) return "لا يوجد تاريخ";
    return new Date(dateStr).toLocaleDateString("ar-EG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const timeLabel = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const visitDate = (visit) => visit.visit_date || visit.visit_Date;

  const visitMeta = (visit) => {
    const date = visitDate(visit);
    const parts = [fullDate(date), timeLabel(date)];
    if (visit.isFinished) parts.push("مكتملة");
    return parts.filter(Boolean).join(" · ");
  };

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="panel" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="panel-header">
          <button className="panel-close" onClick={onClose} aria-label="إغلاق">
            <Icon name="close" size={15} />
          </button>
          <div className="panel-avatar">
            <Icon name="user" size={28} />
          </div>
          <h3 className="panel-name">{patient.name}</h3>
          <p className="panel-phone">
            <span className="phone-icon">
              <Icon name="phone" size={13} />
            </span>
            <span dir="ltr">{patient.phone}</span>
          </p>
          <div className="panel-badges">
            <span className="badge badge--active">نشط</span>
            <span className="badge badge--visits">
              <Icon name="clipboard" size={13} />
              {history.length} زيارة
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="panel-body">
          {isDemoPatient && (
            <div className="demo-lock-note panel-demo-note">
              بيانات طبية وهمية للعرض فقط
            </div>
          )}

          <div className="panel-section-title">
            <Icon name="clipboard" size={15} />
            الزيارات السابقة
            <span className="records-count">{history.length} سجل</span>
          </div>

          {history.length === 0 ? (
            <div className="empty-state">لا يوجد زيارات سابقة</div>
          ) : (
            history.map((visit, i) => (
              <div className="visit-card" key={i}>
                <div className="visit-card-header">
                  <span className="visit-day">{dayName(visitDate(visit))}</span>
                  <span className="visit-date">{visitMeta(visit)}</span>
                </div>

                <div className="visit-field">
                  <span className="field-label">التشخيص</span>
                  <div className="field-icon field-icon--diagnosis">
                    <Icon name="stethoscope" size={14} />
                  </div>
                  <span className="field-value field-value--diagnosis">{visit.diagnosis}</span>
                </div>

                <div className="visit-field">
                  <span className="field-label">الأدوية</span>
                  <div className="field-icon field-icon--medicine">
                    <Icon name="pill" size={14} />
                  </div>
                  <span className="field-value field-value--medicine">{visit.medicines}</span>
                </div>

                <div className="visit-field">
                  <span className="field-label">ملاحظات</span>
                  <div className="field-icon field-icon--notes">
                    <Icon name="note" size={14} />
                  </div>
                  <span className="field-value">{visit.notes}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientPanel;