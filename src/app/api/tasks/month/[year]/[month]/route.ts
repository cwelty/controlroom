import { NextRequest, NextResponse } from 'next/server';
import { getTasksByMonth } from '@/lib/db';

export const revalidate = 3600; // ISR: revalidate every hour

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ year: string; month: string }> }
) {
  try {
    const { year, month } = await params;
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);

    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return NextResponse.json(
        { error: 'Invalid year or month' },
        { status: 400 }
      );
    }

    // Validate reasonable year range
    const currentYear = new Date().getFullYear();
    if (yearNum < 2020 || yearNum > currentYear + 1) {
      return NextResponse.json(
        { error: 'Year must be between 2020 and next year' },
        { status: 400 }
      );
    }

    const tasks = await getTasksByMonth(yearNum, monthNum);
    
    // Add cache headers for ISR
    return NextResponse.json(tasks, {
      headers: {
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching tasks by month:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}