import { NextRequest, NextResponse } from 'next/server';
import { recordAbsence, getAllAbsences, getAbsencesByTeacher, getAbsencesByDateRange } from '@/lib/data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, classId, teacherId, date, session } = body;

    if (!studentId || !classId || !teacherId || !date || !session) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const absence = recordAbsence({ studentId, classId, teacherId, date, session });
    return NextResponse.json(absence);
  } catch (error) {
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const teacherId = searchParams.get('teacherId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (teacherId) {
    const absences = getAbsencesByTeacher(teacherId);
    return NextResponse.json(absences);
  }

  if (startDate && endDate) {
    const absences = getAbsencesByDateRange(startDate, endDate);
    return NextResponse.json(absences);
  }

  const absences = getAllAbsences();
  return NextResponse.json(absences);
}
