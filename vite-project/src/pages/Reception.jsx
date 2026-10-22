import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import BookingModal from "../components/BookingModal";
import DemoBanner from "../components/DemoBanner";
import Icon from "../components/Icon";
import "../styles/reception.css";
import { API_BASE_URL } from "../config";
import { getDemoDataset, useDemoMode } from "../demo/demoStore";


const times = ["10:00","10:30","11:00","11:30","12:00","14:00","14:30","15:00"];
const allowedDays = ["2026-05-17","2026-05-18","2026-05-19","2026-05-20"];

const groupAppointments = (result) => {
  const groupedData = {};
  result.forEach((item) => {
    if (!item?.date) return;
    const day = item.date.split("T")[0];
    if (!groupedData[day]) groupedData[day] = [];
    groupedData[day].push({
      time: item.time?.substring(0, 5) || "",
      name: item.patientName || "Patient",
      phone: item.phone || "01000000000",
      id: item.id,
      status: item.status || "pending",
    });
  });

  const filteredData = {};
  allowedDays.forEach((day) => {
    filteredData[day] = groupedData[day] || [];
  });
  return filteredData;
};

function Reception() {
  const isDemo = useDemoMode();
  const [activeDay, setActiveDay] = useState("2026-05-17");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [realData, setRealData] = useState({});

  const demoDataset = isDemo ? getDemoDataset() : null;
  const data = demoDataset ? groupAppointments(demoDataset.appointments) : realData;
  const activeSlot = selectedSlot?.demo === isDemo ? selectedSlot : null;

  const fetchData = useCallback((keepDay = "") => {
    if (isDemo) return;

    fetch(`${API_BASE_URL}/appointments`)
      .then((res) => res.json())
      .then((result) => {
        setRealData(groupAppointments(Array.isArray(result) ? result : []));
        if (keepDay) setActiveDay(keepDay);
      })
      .catch(() => {
        setRealData({});
      });
  }, [isDemo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const todayBookings = (data[activeDay] || []).length;
  const pendingCount  = (data[activeDay] || []).filter(b => b.status === "pending").length;
  const paidCount     = (data[activeDay] || []).filter(b => b.status === "paid").length;

  return (
    <div className="container" dir="rtl">
      <Sidebar />

      <div className="main">
        <div className="page-shell">
          <DemoBanner />

          {/* ───── Header ───── */}
          <div className="rec-header">
            <div className="rec-header-right">
              <div className="rec-subtitle">
                <Icon name="clipboard" size={14} />
                قسم الاستقبال
              </div>
              <h1 className="rec-title">جدول المواعيد</h1>
              <p className="rec-desc">
                متابعة الحجوزات اليومية، إضافة حجوزات جديدة، وتتبع حالة الدفع.
              </p>
            </div>
          </div>

          {/* ───── Stat Cards ───── */}
          <div className="rec-stats">
            <div className="rec-stat-card">
              <div className="rec-stat-icon warning">
                <Icon name="alert" size={19} />
              </div>
              <div className="rec-stat-info">
                <h3>{pendingCount}</h3>
                <span>بانتظار الدفع</span>
              </div>
            </div>

            <div className="rec-stat-card">
              <div className="rec-stat-icon success">
                <Icon name="check" size={19} />
              </div>
              <div className="rec-stat-info">
                <h3>{paidCount}</h3>
                <span>مدفوعة</span>
              </div>
            </div>

            <div className="rec-stat-card">
              <div className="rec-stat-icon neutral">
                <Icon name="calendar" size={19} />
              </div>
              <div className="rec-stat-info">
                <h3>{todayBookings}</h3>
                <span>حجوزات اليوم</span>
              </div>
              <span className="rec-stat-badge">من {times.length}</span>
            </div>
          </div>

          {/* ───── Filters Bar ───── */}
          <div className="rec-filters-bar">
            <button type="button" className="rec-filter-btn-blue">
              <Icon name="plus" size={15} />
              إضافة يوم
            </button>
            <div className="rec-filters-center">
              <div className="rec-filter-group">
                <label htmlFor="rec-filter-day">اختر اليوم</label>
                <select id="rec-filter-day">
                  {["الأحد","الاثنين","الثلاثاء","الأربعاء"].map((d,i) => <option key={i}>{d}</option>)}
                </select>
              </div>
              <div className="rec-filter-group">
                <label htmlFor="rec-filter-month">اختر الشهر</label>
                <select id="rec-filter-month">
                  {["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"].map((m,i) => <option key={i}>{m}</option>)}
                </select>
              </div>
              <div className="rec-filter-group">
                <label htmlFor="rec-filter-date">اختر التاريخ</label>
                <select id="rec-filter-date">
                  {Array.from({length:31},(_,i) => <option key={i+1}>{i+1}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ───── Day Tabs — أول يوم على اليمين ───── */}
          <div className="rec-tabs" role="group" aria-label="اختيار اليوم">
            {allowedDays.map((day) => (
              <button
                type="button"
                key={day}
                className={`rec-tab ${activeDay === day ? "active" : ""}`}
                aria-pressed={activeDay === day}
                onClick={() => setActiveDay(day)}
              >
                <span className="rec-tab-dot"></span>
                <span dir="ltr">{day}</span>
              </button>
            ))}
          </div>

          {/* ───── Table ───── */}
          <div className="rec-table">
            <div className="rec-table-header">
              <span>الوقت</span>
              <span>اسم المريض</span>
              <span>رقم الهاتف</span>
              <span>رقم الحجز</span>
              <span>الحالة</span>
            </div>

            {times.map((time, index) => {
              const booking = (data[activeDay] || []).find(b => b.time === time);
              return (
                <div className="rec-row" key={index}>
                  <span className="rec-time">
                    <Icon name="clock" size={14} />
                    <span dir="ltr">{time}</span>
                  </span>
                  {booking ? (
                    <>
                      <span>{booking.name}</span>
                      <span dir="ltr">{booking.phone}</span>
                      <span dir="ltr">{booking.id}</span>
                      <span className={`rec-status ${booking.status}`}>
                        {booking.status === "pending" ? "بانتظار الدفع"
                         : booking.status === "paid"  ? "مدفوعة"
                         : booking.status}
                      </span>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="rec-book-bar"
                      onClick={() =>
                        setSelectedSlot({
                          value: `${activeDay} - ${time}`,
                          demo: isDemo,
                        })
                      }
                    >
                      <Icon name="plus" size={14} />
                      إضافة حجز
                    </button>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>

      <BookingModal
        slot={activeSlot?.value}
        demo={activeSlot?.demo}
        onClose={() => {
          const currentDay = activeDay;
          setSelectedSlot(null);
          fetchData(currentDay);
        }}
      />
    </div>
  );
}

export default Reception;