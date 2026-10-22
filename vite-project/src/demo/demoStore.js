import { useSyncExternalStore } from "react";

export const DEMO_MODE_STORAGE_KEY = "clinic.demo.mode.v1";
export const DEMO_DATA_STORAGE_KEY = "clinic.demo.data.v1";

const DEMO_MODE_EVENT = "clinic:demo-mode-change";
const DEMO_DATA_VERSION = 2;
const DEMO_FIRST_PATIENT_ID = "demo-patient-ahmed-hassan";
const DEMO_FIRST_APPOINTMENT_ID = "demo-appointment-ahmed-hassan-001";
const DEMO_FIRST_PATIENT_NAME = "أحمد حسن — مريض تجريبي";
const DEMO_SECOND_PATIENT_ID = "demo-patient-mahmoud-sami";
const DEMO_SECOND_APPOINTMENT_ID = "demo-appointment-mahmoud-sami-001";
const DEMO_SECOND_HISTORY_ID = "demo-history-mahmoud-sami-001";
const DEMO_SECOND_PATIENT_NAME = "محمود سامي — مريض تجريبي";
const DEMO_SECOND_APPOINTMENT_DATE = "2026-05-10T12:00:00.000Z";
const DEMO_SECOND_VISIT_DATE = "2026-05-10T10:00:00";

const DEMO_SCHEDULE = [
  { date: "2026-05-17", day: "الأحد 17 مايو", times: ["10:00", "10:30", "11:00", "11:30", "12:00", "14:00", "15:00"] },
  { date: "2026-05-18", day: "الاثنين 18 مايو", times: ["10:00", "10:30", "11:00", "11:30", "12:00", "14:00", "15:00"] },
  { date: "2026-05-19", day: "الثلاثاء 19 مايو", times: ["10:00", "10:30", "11:00", "11:30", "12:00", "14:00", "15:00"] },
  { date: "2026-05-20", day: "الأربعاء 20 مايو", times: ["10:00", "10:30", "11:00", "11:30", "12:00", "14:00", "15:00"] },
];

const FIRST_DEMO_SLOT = {
  date: DEMO_SCHEDULE[0].date,
  time: DEMO_SCHEDULE[0].times[0],
};

let memoryMode = false;
let memoryDataset = null;

function readStorage(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    return false;
  }
  return true;
}

function removeStorage(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    return false;
  }
  return true;
}

function createFirstPatient() {
  return {
    id: DEMO_FIRST_PATIENT_ID,
    full_Name: DEMO_FIRST_PATIENT_NAME,
    phone: "لا يوجد",
    gender: null,
    address: null,
    isDemo: true,
  };
}

function createFirstAppointment() {
  return {
    id: DEMO_FIRST_APPOINTMENT_ID,
    patientId: DEMO_FIRST_PATIENT_ID,
    patientName: DEMO_FIRST_PATIENT_NAME,
    phone: "لا يوجد",
    date: `${FIRST_DEMO_SLOT.date}T12:00:00.000Z`,
    time: `${FIRST_DEMO_SLOT.time}:00`,
    status: "paid",
    isFinished: false,
    isDemo: true,
  };
}

function createSecondPatient() {
  return {
    id: DEMO_SECOND_PATIENT_ID,
    full_Name: DEMO_SECOND_PATIENT_NAME,
    phone: "لا يوجد",
    gender: "male",
    address: null,
    isDemo: true,
  };
}

function createSecondAppointment() {
  return {
    id: DEMO_SECOND_APPOINTMENT_ID,
    patientId: DEMO_SECOND_PATIENT_ID,
    patientName: DEMO_SECOND_PATIENT_NAME,
    phone: "لا يوجد",
    date: DEMO_SECOND_APPOINTMENT_DATE,
    time: "10:00:00",
    status: "paid",
    isFinished: true,
    isDemo: true,
  };
}

function createSecondHistory() {
  return {
    id: DEMO_SECOND_HISTORY_ID,
    patient_Id: DEMO_SECOND_PATIENT_ID,
    patient_Name: DEMO_SECOND_PATIENT_NAME,
    diagnosis: "تشخيص توضيحي — غير صالح للاستخدام الطبي.",
    medicines: "دواء تجريبي A — ليس دواءً حقيقيًا.",
    notes:
      "سبب الزيارة: زيارة متابعة تجريبية. — سجل وهمي لعرض الملاحظات والتاريخ المرضي في واجهة النظام فقط. — متابعة تجريبية بعد أسبوعين.",
    visit_date: DEMO_SECOND_VISIT_DATE,
    isFinished: true,
    isDemo: true,
  };
}

function mergeMissing(items, additions) {
  const result = [];
  const existingIds = new Set();

  for (const item of Array.isArray(items) ? items : []) {
    if (!item) continue;
    if (item.id && existingIds.has(item.id)) continue;
    if (item.id) existingIds.add(item.id);
    result.push(item);
  }

  for (const item of additions) {
    if (item?.id && !existingIds.has(item.id)) {
      existingIds.add(item.id);
      result.push(item);
    }
  }

  return result;
}

function createDemoDataset() {
  return {
    version: DEMO_DATA_VERSION,
    isDemo: true,
    source: "frontend-demo",
    createdAt: new Date().toISOString(),
    patients: [createFirstPatient(), createSecondPatient()],
    appointments: [createFirstAppointment(), createSecondAppointment()],
    history: [createSecondHistory()],
  };
}

function upgradeVersionOne(value) {
  return {
    version: DEMO_DATA_VERSION,
    isDemo: true,
    source: value.source || "frontend-demo",
    createdAt: value.createdAt || new Date().toISOString(),
    patients: [
      value.patient?.id === DEMO_FIRST_PATIENT_ID ? value.patient : createFirstPatient(),
      createSecondPatient(),
    ],
    appointments: [
      value.appointment?.id === DEMO_FIRST_APPOINTMENT_ID
        ? value.appointment
        : createFirstAppointment(),
      createSecondAppointment(),
    ],
    history: [createSecondHistory()],
  };
}

function normalizeVersionTwo(value) {
  return {
    version: DEMO_DATA_VERSION,
    isDemo: true,
    source: value.source || "frontend-demo",
    createdAt: value.createdAt || new Date().toISOString(),
    patients: mergeMissing(value.patients, [createFirstPatient(), createSecondPatient()]),
    appointments: mergeMissing(value.appointments, [
      createFirstAppointment(),
      createSecondAppointment(),
    ]),
    history: mergeMissing(value.history, [createSecondHistory()]),
  };
}

function normalizeDataset(value) {
  if (!value || typeof value !== "object" || value.isDemo !== true) return null;

  if (value.version === 1 && value.patient && value.appointment) {
    return upgradeVersionOne(value);
  }

  if (Array.isArray(value.patients) && Array.isArray(value.appointments)) {
    return normalizeVersionTwo(value);
  }

  return null;
}

export function getDemoDataset() {
  const stored = readStorage(DEMO_DATA_STORAGE_KEY);

  if (stored) {
    try {
      const normalized = normalizeDataset(JSON.parse(stored));
      if (normalized) {
        memoryDataset = normalized;
        const serialized = JSON.stringify(normalized);
        if (serialized !== stored) {
          writeStorage(DEMO_DATA_STORAGE_KEY, serialized);
        }
        return normalized;
      }
    } catch {
      memoryDataset = null;
    }
  }

  if (memoryDataset) {
    return memoryDataset;
  }

  const dataset = createDemoDataset();
  memoryDataset = dataset;
  writeStorage(DEMO_DATA_STORAGE_KEY, JSON.stringify(dataset));
  return dataset;
}

export function getDemoPatients() {
  return getDemoDataset().patients;
}

export function getDemoAppointments() {
  return getDemoDataset().appointments;
}

export function getDemoHistoryForPatient(patientId, patientName) {
  return getDemoDataset().history.filter(
    (item) =>
      (patientId && item.patient_Id === patientId) ||
      (patientName && item.patient_Name === patientName)
  );
}

export function getDemoModeSnapshot() {
  const stored = readStorage(DEMO_MODE_STORAGE_KEY);

  if (stored === null) {
    return memoryMode;
  }

  return stored === "true";
}

export function subscribeDemoMode(callback) {
  const onStorage = (event) => {
    if (event.key === DEMO_MODE_STORAGE_KEY) callback();
  };

  window.addEventListener(DEMO_MODE_EVENT, callback);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(DEMO_MODE_EVENT, callback);
    window.removeEventListener("storage", onStorage);
  };
}

export function setDemoMode(enabled) {
  memoryMode = enabled;

  if (enabled) {
    getDemoDataset();
    if (!writeStorage(DEMO_MODE_STORAGE_KEY, "true")) {
      memoryMode = true;
    }
  } else {
    removeStorage(DEMO_MODE_STORAGE_KEY);
  }

  window.dispatchEvent(new Event(DEMO_MODE_EVENT));
}

export function toggleDemoMode() {
  setDemoMode(!getDemoModeSnapshot());
}

export function useDemoMode() {
  return useSyncExternalStore(subscribeDemoMode, getDemoModeSnapshot, () => false);
}
