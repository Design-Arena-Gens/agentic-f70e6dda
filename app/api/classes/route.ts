import { NextResponse } from 'next/server';
import { getAllClasses } from '@/lib/data';

export async function GET() {
  const classes = getAllClasses();
  return NextResponse.json(classes);
}
