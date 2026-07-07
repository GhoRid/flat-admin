export const parseGradeNumber = (grade: string) => {
  const n = Number(grade.replace(/\D/g, ""));
  return Number.isFinite(n) ? n : 0;
};

export const parsePaymentDay = (s: string) => {
  const n = Number(s.replace(/\D/g, ""));
  return Number.isFinite(n) ? n : 0;
};
