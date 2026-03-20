// src/components/dashboard/catUtils.js

export const CAT_KEYS = [
  "cat8Cough",
  "cat8Phlegm",
  "cat8ChestTightness",
  "cat8Breathlessness",
  "cat8Activities",
  "cat8Confidence",
  "cat8Sleep",
  "cat8Energy",
];

export function catColor(score) {
  if (score == null) return { text: "#7a9a98", bg: "#f0f7f6", border: "#c8e0de" };
  if (score <= 10)   return { text: "#0f8a6a", bg: "#edfaf6", border: "#a8e6d4" };
  if (score <= 20)   return { text: "#a16200", bg: "#fefbe8", border: "#f6df85" };
  if (score <= 30)   return { text: "#c05400", bg: "#fff4ed", border: "#fdc99a" };
  return               { text: "#b91c1c", bg: "#fff0f0", border: "#fca5a5" };
}

export function resolveMedicines(record, medicines, userMedicines, fallbackLabel) {
  return (record.medicines ?? []).map((id, i) => {
    const base = medicines?.find((m) => m.id === id);
    const user = userMedicines?.find((um) => um.medicineId === id);
    return {
      id,
      name:  base?.name ?? user?.medicine?.name ?? `${fallbackLabel} ${id}`,
      image: user?.medicine?.image,
      times: record.medicinesUsedTimes?.[i] ?? null,
      atc:   record.medicinesAtc?.[i]       ?? null,
    };
  });
}
