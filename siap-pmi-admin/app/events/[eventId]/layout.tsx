import EventClientLayout from './EventClientLayout';

export default async function EventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  return <EventClientLayout eventId={eventId}>{children}</EventClientLayout>;
}
