import { useState } from "react";
import Icon from "./Icon";
import "../styles/bookingModal.css";
import { API_BASE_URL } from "../config";
import { useDemoMode } from "../demo/demoStore";

function BookingModal({ slot, demo = false, onClose }) {
  const isDemo = useDemoMode();
  const demoLocked = isDemo || demo;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentType, setPaymentType] = useState("unpaid");
  const [toast, setToast] = useState({ show: false, text: "", type: "" });

  if (!slot) return null;

  const bookingId = "4" + Math.floor(Math.random() * 1000000);

  const showToast = (text, type) => {
    setToast({ show: true, text, type });
    setTimeout(() => {
      setToast({ show: false, text: "", type: "" });
      if (type === "success") onClose();
    }, 2000);
  };

  const handleBooking = async () => {
    if (demoLocked) return;

    const [datePart, timePart] = slot.split(" - ");
    try {
      const patientRes = await fetch(`${API_BASE_URL}/patients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_Name: name, phone }),
      });
      const patient = await patientRes.json();
      const paymentStatus = paymentType === "paid" ? "تم الدفع" : "سيتم الدفع عند الحضور";
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_Id: patient.id,
          date: datePart,
          time: timePart + ":00",
          status: paymentStatus,
        }),
      });
      const result = await response.json();
      console.log(result);
      const savedAppointments = JSON.parse(localStorage.getItem("appointments")) || [];
      savedAppointments.push({ date: datePart, time: timePart, patientName: name, phone, status: paymentStatus });
      localStorage.setItem("appointments", JSON.stringify(savedAppointments));
      showToast("تم الحجز بنجاح", "success");
    } catch (error) {
      console.log(error);
      showToast("حدث خطأ أثناء الحجز", "error");
    }
  };

  return (
    <>
      {/* Toast */}
      {toast.show && (
        <div className="bm-toast" data-type={toast.type} role="status">
          <Icon name={toast.type === "success" ? "check" : "alert"} size={18} />
          {toast.text}
        </div>
      )}

      <div className="bm-overlay" onClick={onClose}>
        <div className="bm-modal" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="bm-header">
            <button className="bm-close" onClick={onClose} aria-label="إغلاق">
              <Icon name="close" size={16} />
            </button>
            <div className="bm-header-text">
              <h3>إضافة حجز جديد</h3>
              <p>أدخل بيانات المريض لإتمام الحجز</p>
            </div>
          </div>

          {/* Body */}
          <div className="bm-body">

            {/* Slot + ID */}
            <div className="bm-row">
              <div className="bm-field">
                <label htmlFor="booking-id">رقم الحجز</label>
                <input id="booking-id" type="text" value={bookingId} readOnly dir="ltr" className="bm-input bm-readonly" />
              </div>
              <div className="bm-field">
                <label htmlFor="booking-slot">الموعد</label>
                <input id="booking-slot" type="text" value={slot} readOnly dir="ltr" className="bm-input bm-readonly bm-slot" />
              </div>
            </div>

            {/* Name */}
            <div className="bm-field">
              <label htmlFor="booking-name">الاسم الكامل <span className="bm-required">*</span></label>
              <input
                id="booking-name"
                type="text"
                placeholder="اسم المريض"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bm-input"
              />
            </div>

            {/* Phone */}
            <div className="bm-field">
              <label htmlFor="booking-phone">رقم الهاتف <span className="bm-required">*</span></label>
              <input
                id="booking-phone"
                type="text"
                placeholder="01xxxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                dir="ltr"
                className="bm-input bm-input--ltr"
              />
            </div>

            {/* DOB + Gender */}
            <div className="bm-row">
              <div className="bm-field">
                <label>الجنس</label>
                <div className="bm-radios">
                  <label className="bm-radio-label">
                    <input type="radio" name="gender" /> ذكر
                  </label>
                  <label className="bm-radio-label">
                    <input type="radio" name="gender" /> أنثى
                  </label>
                </div>
              </div>
              <div className="bm-field">
                <label htmlFor="booking-dob">تاريخ الميلاد</label>
                <input id="booking-dob" type="date" className="bm-input" />
              </div>
            </div>

            {/* Address */}
            <div className="bm-field">
              <label htmlFor="booking-address">العنوان</label>
              <input id="booking-address" type="text" placeholder="عنوان المريض" className="bm-input" />
            </div>

            {/* Payment */}
            <div className="bm-field">
              <label>طريقة الدفع</label>
              <div className="bm-payment-options">
                <label className={`bm-payment-opt ${paymentType === "unpaid" ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentType === "unpaid"}
                    onChange={() => setPaymentType("unpaid")}
                  />
                  الدفع عند الحضور
                </label>
                <label className={`bm-payment-opt ${paymentType === "paid" ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentType === "paid"}
                    onChange={() => setPaymentType("paid")}
                  />
                  الدفع عبر الإنترنت
                </label>
              </div>
            </div>

            {/* Payment notices */}
            {paymentType === "unpaid" && (
              <div className="bm-notice bm-notice--warn">
                <Icon name="card" size={16} />
                سيتم الدفع عند الحضور
              </div>
            )}

            {paymentType === "paid" && (
              <div className="bm-field">
                <label>وسيلة الدفع:</label>
                <div className="bm-payment-options">
                  <label className="bm-payment-opt active">
                    <input type="radio" checked readOnly />
                    <Icon name="phone" size={15} />
                    فودافون كاش
                  </label>
                </div>
                <div className="bm-notice bm-notice--success">
                  يرجى دفع 200 ج للرقم التالي:<br />01012345678
                </div>
              </div>
            )}

            {demoLocked && (
              <div className="bm-notice bm-notice--warn">
                وضع تجريبي: إجراء الحجز معطّل ولن تُرسل أي بيانات إلى قاعدة البيانات.
              </div>
            )}

          </div>

          {/* Actions */}
          <div className="bm-actions">
            <button
              className="bm-btn-save"
              onClick={handleBooking}
              disabled={demoLocked}
              title={demoLocked ? "غير متاح في الوضع التجريبي" : undefined}
            >
              حفظ
            </button>
            <button className="bm-btn-cancel" onClick={onClose}>إلغاء</button>
          </div>

        </div>
      </div>
    </>
  );
}

export default BookingModal;