'use client';
import { EventContextProvider } from './EventContext';
import EventHeader from './_components/EventHeader';
import EventNav from './_components/EventNav';

export default function EventClientLayout({
  eventId,
  children,
}: {
  eventId: string;
  children: React.ReactNode;
}) {
  return (
    <EventContextProvider eventId={eventId}>
      <EventHeader />
      <EventNav />
      <div>{children}</div>
    </EventContextProvider>
  );
}
