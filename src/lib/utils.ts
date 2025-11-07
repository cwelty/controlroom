import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Task } from './db';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateForTimezone(dateString: string, timezone: string = 'America/Los_Angeles'): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getWeekRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

export function getMonthRange(year: number, month: number): { start: Date; end: Date } {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
}

export function groupTasksByPeriod(tasks: Task[], groupBy: 'week' | 'month') {
  const groups = new Map();
  
  tasks.forEach(task => {
    const date = new Date(task.created_at);
    let key: string;
    
    if (groupBy === 'week') {
      const { start } = getWeekRange(date);
      key = `${start.getFullYear()}-W${Math.ceil((start.getDate() + start.getDay()) / 7)}`;
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(task);
  });
  
  return Array.from(groups.entries()).map(([key, tasks]) => ({
    key,
    tasks,
    title: formatPeriodTitle(key, groupBy),
  }));
}

function formatPeriodTitle(key: string, type: 'week' | 'month'): string {
  if (type === 'month') {
    const [year, month] = key.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  } else {
    const [year, week] = key.split('-W');
    return `Week ${week}, ${year}`;
  }
}

export function isValidHotkey(key: string): boolean {
  return /^[a-zA-Z0-9]$/.test(key);
}

export function processTemplateTitle(template: string, title: string): string {
  return template.replace(/\{title\}/g, title);
}