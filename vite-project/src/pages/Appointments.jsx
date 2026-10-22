import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import BookingModal from "../components/BookingModal";
import DemoBanner from "../components/DemoBanner";
import Icon from "../components/Icon";
import "../index.css";
import "../styles/appointments.css";
import "../styles/bookingModal.css";
import { API_BASE_URL } from "../config";
import { getDemoDataset, useDemoMode } from "../demo/demoStore";

const data = [
  { day: "الأحد 17 مايو", date: "2026-05-17", times: ["10:00","10:30","11:00","11:30","12:00","14:00","15:00"] },
  { day: "الاثنين 18 مايو", date: "2026-05-18", times: ["10:00","10:30","11:00","11:30","12:00","14:00","15:00"] },
  { day: "الثلاثاء 19 مايو", date: "2026-05-19", times: ["10:00","10:30","11:00","11:30","12:00","14:00","15:00"] },
  { day: "الأربعاء 20 مايو", date: "2026-05-20", times: ["10:00","10:30","11:00","11:30","12:00","14:00","15:00"] },
];

const totalSlots = data.reduce((acc, d) => acc + d.times.length, 0);

function Appointments() {
  const isDemo = useDemoMode();
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [realBookedSlots, setRealBookedSlots] = useState([]);
  const [selectedDay, setSelectedDay] = useState(data[0].date);

  const demoDataset = isDemo ? getDemoDataset() : null;
  const bookedSlots = demoDataset
    ? demoDataset.appointments.filter((appointment) => !appointment.isFinished)
    : realBookedSlots;
  const activeSlot = selectedSlot?.demo === isDemo ? selectedSlot : null;

  useEffect(() => {
    if (isDemo) return;

    let cancelled = false;

    fetch(`${API_BASE_URL}/appointments`)
      .then((res) => res.json())
      .then((result) => {
        if (!cancelled) setRealBookedSlots(Array.isArray(result) ? result : []);
      })
      .catch(() => {
        if (!cancelled) setRealBookedSlots([]);
      });

    return () => {
      cancelled = true;
    };
  }, [isDemo]);

  const isBooked = (date, time) =>
    bookedSlots.some(
      (item) =>
        item.date?.split("T")[0] === date &&
        item.time?.toString().substring(0, 5) === time
    );

  const bookedCount = data.reduce(
    (acc, d) => acc + d.times.filter((t) => isBooked(d.date, t)).length,
    0
  );
  const availableCount = totalSlots - bookedCount;
  const activeDay = data.find((day) => day.date === selectedDay) || data[0];
  const activeBooked = activeDay.times.filter((t) => isBooked(activeDay.date, t)).length;
  const activeAvailable = activeDay.times.length - activeBooked;

  return (
    <div className="container" dir="rtl">
      <Sidebar />

      <div className="main">
        <div className="page-shell booking-shell">
          <DemoBanner />

          {/* ───── Intro ───── */}
          <section className="booking-hero">
            <div className="booking-hero-copy">
              <div className="eyebrow">
                <Icon name="sparkle" size={14} />
                الحجز الإلكتروني
              </div>
              <h1 className="booking-headline">
                رعاية تستحقّها.
                <span>في وقت يناسبك.</span>
              </h1>
              <p className="booking-intro">
                اختر اليوم والوقت المناسب لحجز موعدك في العيادة.
              </p>
            </div>

            <aside className="doctor-card" aria-label="بيانات الطبيب">
              <div className="doctor-card-inner">
                <span className="doctor-card-label">طبيبك</span>
                <div className="doctor-card-avatar">
                  <Icon name="stethoscope" size={30} strokeWidth={1.5} />
                </div>
                <h2 className="doctor-card-name">د. أحمد محمد الشرقاوي</h2>
                <p className="doctor-card-specialty">استشاري باطنة</p>
                <div className="doctor-card-divider" />
                <p className="doctor-card-hours">
                  <Icon name="clock" size={15} />
                  الأحد - الأربعاء
                </p>
                <p className="doctor-card-hours">
                  <span dir="ltr">10:00 ص - 4:00 م</span>
                </p>
              </div>
            </aside>
          </section>

          {/* ───── Booking panel ───── */}
          <section className="booking-panel" aria-labelledby="booking-title">
            <div className="booking-panel-head">
              <div className="booking-panel-heading">
                <span className="booking-kicker">المواعيد المتاحة</span>
                <h2 id="booking-title">احجز موعدك</h2>
              </div>

              <div className="booking-stats">
                <div className="booking-stat booking-stat--warning">
                  <span className="booking-stat-icon">
                    <Icon name="alert" size={17} />
                  </span>
                  <div className="booking-stat-info">
                    <strong>{bookedCount}</strong>
                    <span>محجوزة</span>
                  </div>
                </div>

                <div className="booking-stat booking-stat--success">
                  <span className="booking-stat-icon">
                    <Icon name="check" size={17} />
                  </span>
                  <div className="booking-stat-info">
                    <strong>{availableCount}</strong>
                    <span>متاحة</span>
                  </div>
                </div>

                <div className="booking-stat">
                  <span className="booking-stat-icon">
                    <Icon name="calendar" size={17} />
                  </span>
                  <div className="booking-stat-info">
                    <strong>{totalSlots}</strong>
                    <span>إجمالي المواعيد</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ───── Filters Bar ───── */}
            <div className="booking-filters">
              <button type="button" className="btn-add-day">
                <Icon name="plus" size={15} />
                إضافة يوم
              </button>
              <div className="booking-filters-center">
                <div className="booking-filter-group">
                  <label htmlFor="filter-day">اختر اليوم</label>
                  <select id="filter-day">
                    {["الأحد","الاثنين","الثلاثاء","الأربعاء"].map((d, i) => (
                      <option key={i}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="booking-filter-group">
                  <label htmlFor="filter-month">اختر الشهر</label>
                  <select id="filter-month">
                    {["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"].map((m, i) => (
                      <option key={i}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="booking-filter-group">
                  <label htmlFor="filter-date">اختر التاريخ</label>
                  <select id="filter-date">
                    {Array.from({ length: 31 }, (_, i) => (
                      <option key={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ───── Day selection ───── */}
            <div className="day-tabs" role="group" aria-label="اختيار اليوم">
              {data.map((day) => {
                const bookedForDay = day.times.filter((t) => isBooked(day.date, t)).length;
                const isActive = day.date === activeDay.date;
                const [weekday, ...rest] = day.day.split(" ");
                return (
                  <button
                    type="button"
                    key={day.date}
                    className={`day-tab ${isActive ? "active" : ""}`}
                    aria-pressed={isActive}
                    onClick={() => setSelectedDay(day.date)}
                  >
                    <span className="day-tab-weekday">{weekday}</span>
                    <span className="day-tab-date">{rest.join(" ")}</span>
                    <span className="day-tab-count">
                      <span dir="ltr">{bookedForDay}/{day.times.length}</span>
                      محجوز
                    </span>
                  </button>
                );
              })}
            </div>

            {/* ───── Times ───── */}
            <div className="times-panel">
              <div className="times-head">
                <div>
                  <h3>الأوقات المتاحة</h3>
                  <p className="times-subtitle">{activeDay.day}</p>
                </div>
                <span className="times-count">
                  <span dir="ltr">{activeAvailable}</span> من{" "}
                  <span dir="ltr">{activeDay.times.length}</span> متاح
                </span>
              </div>

              <div className="times-grid">
                {activeDay.times.map((time, j) => {
                  const booked = isBooked(activeDay.date, time);
                  return (
                    <button
                      type="button"
                      key={j}
                      className={`time-slot ${booked ? "booked" : "available"}`}
                      disabled={booked}
                      onClick={() =>
                        setSelectedSlot({
                          value: `${activeDay.date} - ${time}`,
                          demo: isDemo,
                        })
                      }
                    >
                      <span className="time-slot-time">
                        <Icon name="clock" size={15} />
                        <span dir="ltr">{time}</span>
                      </span>
                      <span className="time-slot-label">
                        {booked ? "محجوز" : "احجز"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="booking-footnote">
              <Icon name="info" size={15} />
              اختر الوقت المناسب ثم أدخل بيانات المريض لإتمام الحجز.
            </div>
          </section>

        </div>
      </div>

      <BookingModal
        slot={activeSlot?.value}
        demo={activeSlot?.demo}
        onClose={() => setSelectedSlot(null)}
      />
    </div>
  );
}

export default Appointments;
