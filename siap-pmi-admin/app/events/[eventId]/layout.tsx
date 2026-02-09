import Link from "next/link";
import { EventContextProvider } from "./EventContext";

export default function EventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { eventId: string };
}) {
  const eventId = params.eventId;
  return (
    <EventContextProvider eventId={eventId}>
      <section style={{ borderBottom: "1px solid #eee", padding: 12, display: "flex", gap: 12 }}>
        <strong>Event: {eventId}</strong>
        <Link href={`/events/${eventId}/panitia/dashboard`}>Panitia</Link>
        <Link href={`/events/${eventId}/pelatih/dashboard`}>Pelatih</Link>
        <Link href={`/events/${eventId}/observer/dashboard`}>Observer</Link>
        <Link href={`/events/${eventId}/peserta/dashboard`}>Peserta</Link>
      </section>
      <div>{children}</div>
    </EventContextProvider>
  );
}
