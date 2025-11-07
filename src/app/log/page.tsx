'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, Calendar, Tag, Clock, ChevronLeft, ChevronDown } from 'lucide-react';
import { Task } from '@/lib/db';
import { formatDateForTimezone, groupTasksByPeriod } from '@/lib/utils';

interface TaskGroup {
  key: string;
  title: string;
  tasks: Task[];
}

export default function ActivityFeedPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [groupedTasks, setGroupedTasks] = useState<TaskGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [groupBy, setGroupBy] = useState<'week' | 'month'>('week');

  useEffect(() => {
    loadTasksForMonth(currentMonth.year, currentMonth.month);
  }, [currentMonth]);

  useEffect(() => {
    if (tasks.length > 0) {
      const groups = groupTasksByPeriod(tasks, groupBy);
      setGroupedTasks(groups);
      
      // Auto-expand first group
      if (groups.length > 0) {
        setExpandedGroups(new Set([groups[0].key]));
      }
    }
  }, [tasks, groupBy]);

  const loadTasksForMonth = async (year: number, month: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/month/${year}/${month}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        console.error('Failed to load tasks');
        setTasks([]);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      if (direction === 'prev') {
        return prev.month === 1 
          ? { year: prev.year - 1, month: 12 }
          : { year: prev.year, month: prev.month - 1 };
      } else {
        return prev.month === 12
          ? { year: prev.year + 1, month: 1 }
          : { year: prev.year, month: prev.month + 1 };
      }
    });
  };

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };

  const formatMonthTitle = (year: number, month: number) => {
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  const isCurrentMonth = () => {
    const now = new Date();
    return currentMonth.year === now.getFullYear() && currentMonth.month === now.getMonth() + 1;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-primary to-background-secondary">
      {/* Header */}
      <div className="border-b border-neon-cyan/20 bg-background-secondary/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="text-center mb-4 md:mb-6">
            <h1 className="text-2xl md:text-4xl font-bold font-orbitron mb-2">Activity Feed</h1>
            <p className="text-neon-cyan/80 font-exo text-sm md:text-base">Task log and timeline</p>
            <div className="w-16 md:w-20 h-1 bg-gradient-to-r from-neon-cyan to-neon-blue mx-auto mt-3 rounded-full neon-glow"></div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Month Navigation */}
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="btn-neon p-2 rounded-lg"
                title="Previous Month"
              >
                <ChevronLeft size={20} />
              </button>
              
              <h2 className="text-xl font-semibold font-exo min-w-48 text-center">
                {formatMonthTitle(currentMonth.year, currentMonth.month)}
                {isCurrentMonth() && (
                  <span className="text-neon-cyan text-sm ml-2">(Current)</span>
                )}
              </h2>
              
              <button
                onClick={() => navigateMonth('next')}
                className="btn-neon p-2 rounded-lg"
                disabled={isCurrentMonth()}
                title="Next Month"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Grouping Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-neon-cyan/80">Group by:</span>
              <div className="flex border border-neon-cyan/30 rounded-lg overflow-hidden">
                <button
                  onClick={() => setGroupBy('week')}
                  className={`px-3 py-1 text-sm transition-all ${
                    groupBy === 'week' 
                      ? 'bg-neon-cyan/20 text-neon-cyan' 
                      : 'text-neon-cyan/60 hover:text-neon-cyan'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setGroupBy('month')}
                  className={`px-3 py-1 text-sm transition-all ${
                    groupBy === 'month' 
                      ? 'bg-neon-cyan/20 text-neon-cyan' 
                      : 'text-neon-cyan/60 hover:text-neon-cyan'
                  }`}
                >
                  Month
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="loading-pulse text-neon-cyan">
              <Calendar size={48} className="mx-auto mb-4" />
              <p className="text-lg font-exo">Loading tasks...</p>
            </div>
          </div>
        ) : groupedTasks.length === 0 ? (
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto mb-4 text-neon-cyan/60" />
            <p className="text-lg font-exo text-neon-cyan/60">No tasks found for this month</p>
            <p className="text-sm text-neon-cyan/40 mt-2">
              Tasks will appear here once created in the admin panel
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedTasks.map(group => {
              const isExpanded = expandedGroups.has(group.key);
              
              return (
                <div
                  key={group.key}
                  className="bg-background-secondary/30 border border-neon-cyan/20 rounded-lg overflow-hidden"
                >
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(group.key)}
                    className="w-full px-6 py-4 text-left hover:bg-neon-cyan/5 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ChevronRight 
                          size={20} 
                          className={`chevron-glow transition-transform duration-200 ${
                            isExpanded ? 'transform rotate-90' : ''
                          }`}
                        />
                        <h3 className="text-lg font-semibold font-exo">{group.title}</h3>
                        <span className="text-sm text-neon-cyan/60 bg-neon-cyan/10 px-2 py-1 rounded-full">
                          {group.tasks.length} task{group.tasks.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 text-neon-cyan/60 ${
                          isExpanded ? 'transform rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {/* Group Content */}
                  {isExpanded && (
                    <div className="border-t border-neon-cyan/20">
                      <div className="p-6 space-y-4">
                        {group.tasks.map(task => (
                          <div
                            key={task.id}
                            className="p-4 bg-background-primary/30 border border-neon-cyan/10 rounded-lg 
                                     hover:border-neon-cyan/30 transition-all duration-200 hover:shadow-lg
                                     hover:shadow-neon-cyan/10"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-lg mb-2">{task.title}</h4>
                                
                                {task.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {task.tags.map(tag => (
                                      <span
                                        key={tag}
                                        className="inline-flex items-center gap-1 px-2 py-1 
                                                 bg-neon-purple/20 border border-neon-purple/40 
                                                 rounded-full text-sm"
                                      >
                                        <Tag size={12} />
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                
                                <div className="flex items-center gap-4 text-sm text-neon-cyan/60">
                                  <div className="flex items-center gap-1">
                                    <Clock size={14} />
                                    {formatDateForTimezone(task.created_at)}
                                  </div>
                                  
                                  <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 bg-neon-blue rounded-full"></span>
                                    {task.source}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}