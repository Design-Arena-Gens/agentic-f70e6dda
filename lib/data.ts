// Mock database - In production, this would be replaced with a real database

export interface Student {
  id: string;
  name: string;
  classId: string;
}

export interface Class {
  id: string;
  name: string;
  year: string;
}

export interface Teacher {
  id: string;
  username: string;
  password: string;
  name: string;
}

export interface Admin {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'principal' | 'supervisor' | 'pedagogical';
}

export interface AbsenceRecord {
  id: string;
  studentId: string;
  classId: string;
  teacherId: string;
  date: string;
  session: string;
  timestamp: string;
}

// Mock data storage
let teachers: Teacher[] = [
  { id: '1', username: 'teacher1', password: 'teacher123', name: 'John Smith' },
  { id: '2', username: 'teacher2', password: 'teacher123', name: 'Sarah Johnson' },
];

let admins: Admin[] = [
  { id: '1', username: 'admin', password: 'admin123', name: 'Admin User', role: 'principal' },
  { id: '2', username: 'supervisor', password: 'super123', name: 'Supervisor User', role: 'supervisor' },
];

const classes: Class[] = [
  { id: '1', name: 'Class 1', year: '1st Year' },
  { id: '2', name: 'Class 2', year: '1st Year' },
  { id: '3', name: 'Class 1', year: '2nd Year' },
  { id: '4', name: 'Class 2', year: '2nd Year' },
  { id: '5', name: 'Class 1', year: '3rd Year' },
  { id: '6', name: 'Class 2', year: '3rd Year' },
];

const students: Student[] = [
  { id: '1', name: 'Alice Brown', classId: '1' },
  { id: '2', name: 'Bob Wilson', classId: '1' },
  { id: '3', name: 'Charlie Davis', classId: '1' },
  { id: '4', name: 'Diana Miller', classId: '1' },
  { id: '5', name: 'Ethan Moore', classId: '1' },
  { id: '6', name: 'Fiona Taylor', classId: '2' },
  { id: '7', name: 'George Anderson', classId: '2' },
  { id: '8', name: 'Hannah Thomas', classId: '2' },
  { id: '9', name: 'Ian Jackson', classId: '3' },
  { id: '10', name: 'Julia White', classId: '3' },
  { id: '11', name: 'Kevin Harris', classId: '3' },
  { id: '12', name: 'Laura Martin', classId: '4' },
  { id: '13', name: 'Mike Thompson', classId: '4' },
  { id: '14', name: 'Nina Garcia', classId: '5' },
  { id: '15', name: 'Oscar Martinez', classId: '5' },
  { id: '16', name: 'Paula Robinson', classId: '6' },
  { id: '17', name: 'Quinn Clark', classId: '6' },
  { id: '18', name: 'Rachel Rodriguez', classId: '6' },
];

let absenceRecords: AbsenceRecord[] = [];

// Teacher functions
export function authenticateTeacher(username: string, password: string): Teacher | null {
  return teachers.find(t => t.username === username && t.password === password) || null;
}

export function getAllTeachers(): Teacher[] {
  return teachers.map(({ password, ...rest }) => rest as Teacher);
}

export function createTeacher(teacher: Omit<Teacher, 'id'>): Teacher {
  const newTeacher = { ...teacher, id: Date.now().toString() };
  teachers.push(newTeacher);
  return newTeacher;
}

export function updateTeacher(id: string, updates: Partial<Teacher>): Teacher | null {
  const index = teachers.findIndex(t => t.id === id);
  if (index === -1) return null;
  teachers[index] = { ...teachers[index], ...updates };
  return teachers[index];
}

export function deleteTeacher(id: string): boolean {
  const index = teachers.findIndex(t => t.id === id);
  if (index === -1) return false;
  teachers.splice(index, 1);
  return true;
}

// Admin functions
export function authenticateAdmin(username: string, password: string): Admin | null {
  return admins.find(a => a.username === username && a.password === password) || null;
}

// Class functions
export function getAllClasses(): Class[] {
  return classes;
}

// Student functions
export function getStudentsByClass(classId: string): Student[] {
  return students.filter(s => s.classId === classId);
}

export function getAllStudents(): Student[] {
  return students;
}

// Absence functions
export function recordAbsence(record: Omit<AbsenceRecord, 'id' | 'timestamp'>): AbsenceRecord {
  const newRecord: AbsenceRecord = {
    ...record,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
  };
  absenceRecords.push(newRecord);
  return newRecord;
}

export function getAbsencesByTeacher(teacherId: string): AbsenceRecord[] {
  return absenceRecords.filter(r => r.teacherId === teacherId);
}

export function getAllAbsences(): AbsenceRecord[] {
  return absenceRecords;
}

export function getAbsencesByDateRange(startDate: string, endDate: string): AbsenceRecord[] {
  return absenceRecords.filter(r => r.date >= startDate && r.date <= endDate);
}

export function getAbsencesByClass(classId: string): AbsenceRecord[] {
  return absenceRecords.filter(r => r.classId === classId);
}

export function getAbsencesByStudent(studentId: string): AbsenceRecord[] {
  return absenceRecords.filter(r => r.studentId === studentId);
}
