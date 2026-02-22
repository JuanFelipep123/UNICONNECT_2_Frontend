export interface Subject {
  id: string;
  name: string;
}

export interface ProfileData {
  career: string;
  semester: number;
  avatar?: string;
  subjects: Subject[];
}

export interface Career {
  value: string;
  label: string;
}

export interface Semester {
  value: number;
  label: string;
}

export const CAREERS: Career[] = [
  { value: 'engineering', label: 'Ingeniería de Sistemas' },
  { value: 'business', label: 'Administración de Empresas' },
  { value: 'design', label: 'Diseño Gráfico' },
  { value: 'psychology', label: 'Psicología' },
  { value: 'marketing', label: 'Marketing Digital' },
];

export const SEMESTERS: Semester[] = [
  { value: 1, label: 'Semestre 1' },
  { value: 2, label: 'Semestre 2' },
  { value: 3, label: 'Semestre 3' },
  { value: 4, label: 'Semestre 4' },
  { value: 5, label: 'Semestre 5' },
  { value: 6, label: 'Semestre 6' },
  { value: 7, label: 'Semestre 7' },
  { value: 8, label: 'Semestre 8' },
  { value: 9, label: 'Semestre 9' },
  { value: 10, label: 'Semestre 10' },
];
