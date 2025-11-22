import { NextRequest, NextResponse } from 'next/server';
import { getStudentsByClass, getAllStudents } from '@/lib/data';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const classId = searchParams.get('classId');

  if (classId) {
    const students = getStudentsByClass(classId);
    return NextResponse.json(students);
  }

  const students = getAllStudents();
  return NextResponse.json(students);
}
