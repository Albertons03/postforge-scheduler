'use client';

import { useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { toast } from 'sonner';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

const locales = {
  'en-US': enUS,
};

interface Post {
  id: string;
  content: string;
  platform: string;
  status: string;
  scheduledAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Post;
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const DnDCalendar = withDragAndDrop<CalendarEvent, object>(Calendar);

interface CalendarViewProps {
  posts: Post[];
  onEventDrop: (postId: string, newDate: Date) => Promise<void>;
}

export function CalendarView({ posts, onEventDrop }: CalendarViewProps) {
  const [view, setView] = useState<View>('month');

  const events: CalendarEvent[] = posts
    .filter((post) => post.scheduledAt !== null)
    .map((post) => {
      const date = new Date(post.scheduledAt!);
      return {
        id: post.id,
        title: post.content.substring(0, 40) + (post.content.length > 40 ? '...' : ''),
        start: date,
        end: date,
        resource: post,
      };
    });

  const handleEventDrop = useCallback(
    async ({ event, start }: { event: CalendarEvent; start: string | Date }) => {
      try {
        const startDate = typeof start === 'string' ? new Date(start) : start;
        await onEventDrop(event.id, startDate);
        toast.success(`Post rescheduled to ${format(startDate, 'PPP')}`);
      } catch (error) {
        toast.error('Failed to reschedule post');
        console.error('Failed to reschedule:', error);
      }
    },
    [onEventDrop]
  );

  const eventStyleGetter = (event: CalendarEvent) => {
    const status = event.resource.status;
    let backgroundColor = '#6b7280'; // gray for draft

    switch (status) {
      case 'scheduled':
        backgroundColor = '#3b82f6'; // blue
        break;
      case 'published':
        backgroundColor = '#10b981'; // green
        break;
      case 'failed':
        backgroundColor = '#ef4444'; // red
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
      <DnDCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        view={view}
        onView={setView}
        onEventDrop={handleEventDrop}
        draggableAccessor={() => true}
        eventPropGetter={eventStyleGetter}
        resizable={false}
        className="custom-calendar"
      />

      <style jsx global>{`
        .custom-calendar {
          color: #f1f5f9;
        }

        .rbc-calendar {
          background: transparent;
        }

        .rbc-header {
          background: #1e293b;
          color: #cbd5e1;
          border-color: #334155;
          padding: 12px 6px;
          font-weight: 600;
        }

        .rbc-month-view,
        .rbc-time-view {
          background: transparent;
          border-color: #334155;
        }

        .rbc-day-bg {
          background: #0f172a;
          border-color: #334155;
        }

        .rbc-today {
          background-color: #1e293b;
        }

        .rbc-off-range-bg {
          background: #0a0e1a;
        }

        .rbc-date-cell {
          color: #94a3b8;
          padding: 8px;
        }

        .rbc-now .rbc-button-link {
          color: #60a5fa;
          font-weight: 700;
        }

        .rbc-toolbar {
          padding: 10px 0 20px;
        }

        .rbc-toolbar button {
          color: #cbd5e1;
          border: 1px solid #475569;
          background: #1e293b;
          padding: 8px 16px;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .rbc-toolbar button:hover {
          background: #334155;
          border-color: #64748b;
        }

        .rbc-toolbar button.rbc-active {
          background: #4f46e5;
          border-color: #4f46e5;
          color: white;
        }

        .rbc-event {
          padding: 4px 8px;
          font-size: 13px;
        }

        .rbc-event-label {
          font-size: 11px;
        }

        .rbc-show-more {
          background-color: #475569;
          color: #e2e8f0;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
