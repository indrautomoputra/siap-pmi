import DashboardCard from '@/components/DashboardCard';
import StatusBanner from '@/components/StatusBanner';

type EventStatus = 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';

interface PageProps {
  params: {
    eventId: string;
  };
}

export default function PanitiaDashboardPage({ params }: PageProps) {
  const mockEvent = {
  id: params.eventId,
  name: 'Pelatihan KSR Dasar Batch 5',
  status: 'ongoing' as const, // ← PASTIKAN INI
};


  const mockSummary = {
    totalEnrollments: 160,
    totalParticipants: 142,
    totalTrainers: 6,
    totalObservers: 3,
    totalEvaluationsSubmitted: 98,
    totalAssessedParticipants: 86,
    evaluationSubmissionRate: 0.69,
    assessmentCoverageRate: 0.61,
  };

  const participants = [
    {
      enrollmentId: 'enr-2026-001',
      participantName: 'Aulia Rahman',
      displayName: 'Aulia Rahman',
      status: 'active',
      reviewStatus: 'approved',
      registeredAt: '2026-02-01',
    },
    {
      enrollmentId: 'enr-2026-002',
      participantName: 'Dimas Pratama',
      displayName: 'Dimas Pratama',
      status: 'active',
      reviewStatus: 'pending_review',
      registeredAt: '2026-02-02',
    },
    {
      enrollmentId: 'enr-2026-003',
      participantName: 'Sari Utami',
      displayName: 'Sari Utami',
      status: 'active',
      reviewStatus: 'approved',
      registeredAt: '2026-02-03',
    },
    {
      enrollmentId: 'enr-2026-004',
      participantName: 'Rizky Andika',
      displayName: 'Rizky Andika',
      status: 'inactive',
      reviewStatus: 'rejected',
      registeredAt: '2026-02-03',
    },
    {
      enrollmentId: 'enr-2026-005',
      participantName: 'Maya Putri',
      displayName: 'Maya Putri',
      status: 'active',
      reviewStatus: 'approved',
      registeredAt: '2026-02-04',
    },
  ];

  const decisions = [
    { id: 'dec-001', participantName: 'Aulia Rahman', decision: 'lulus', decidedAt: '2026-02-10 09:30' },
    { id: 'dec-002', participantName: 'Sari Utami', decision: 'lulus', decidedAt: '2026-02-10 09:35' },
    { id: 'dec-003', participantName: 'Rizky Andika', decision: 'tidak_lulus', decidedAt: '2026-02-10 09:45' },
    { id: 'dec-004', participantName: 'Dimas Pratama', decision: 'ditunda', decidedAt: '2026-02-10 09:50' },
  ];

  const reviewStats = participants.reduce(
    (acc, item) => {
      if (item.reviewStatus === 'approved') acc.approved += 1;
      if (item.reviewStatus === 'rejected') acc.rejected += 1;
      if (item.reviewStatus === 'pending_review') acc.pending += 1;
      return acc;
    },
    { approved: 0, rejected: 0, pending: 0 },
  );

  const decisionStats = decisions.reduce(
    (acc, item) => {
      if (item.decision === 'lulus') acc.lulus += 1;
      if (item.decision === 'tidak_lulus') acc.tidakLulus += 1;
      if (item.decision === 'ditunda') acc.ditunda += 1;
      return acc;
    },
    { lulus: 0, tidakLulus: 0, ditunda: 0 },
  );

  const assessmentRate = `${Math.round(mockSummary.assessmentCoverageRate * 100)}%`;
  const evaluationRate = `${Math.round(mockSummary.evaluationSubmissionRate * 100)}%`;

  const statusLabel: Record<EventStatus, string> = {
    draft: 'Draft',
    published: 'Published',
    ongoing: 'Ongoing',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  const statusClass: Record<EventStatus, string> = {
    draft: 'border-slate-200 bg-slate-100 text-slate-600',
    published: 'border-blue-200 bg-blue-50 text-blue-700',
    ongoing: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    completed: 'border-gray-200 bg-gray-100 text-gray-700',
    cancelled: 'border-red-200 bg-red-50 text-red-700',
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">Panitia – Dashboard</h1>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass[mockEvent.status]}`}
            >
              {statusLabel[mockEvent.status]}
            </span>
          </div>
          <p className="text-slate-600">
            Ringkasan operasional event dan keputusan kelulusan manual.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span className="font-medium text-slate-900">{mockEvent.name}</span>
            <span>Event ID: {mockEvent.id}</span>
            <span>Status: {statusLabel[mockEvent.status]}</span>
          </div>
        </div>

        <StatusBanner status={mockEvent.status} className="max-w-3xl" />

        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Aksi Cepat</h2>
            <p className="text-sm text-slate-600">
              Akses operasional utama untuk panitia event.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <DashboardCard
              title="Enrollment"
              description="Lihat daftar peserta dan status enrollment."
              href={`/events/${mockEvent.id}/enrollments`}
            />
            <DashboardCard
              title="Kelulusan"
              description="Rekap keputusan rapat kelulusan (manual)."
              href={`/events/${mockEvent.id}/graduations`}
            />
            <DashboardCard
              title="Penutupan"
              description="Checklist penutupan event (read-only)."
              href={`/events/${mockEvent.id}/panitia/closure`}
            />
          </div>
        </div>

        <div className="grid gap-4">
          <h2 className="text-lg font-semibold text-slate-900">Ringkasan Operasional</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-500">Total Enrollment</div>
              <div className="text-xl font-semibold text-slate-900">
                {mockSummary.totalEnrollments}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-500">Total Peserta</div>
              <div className="text-xl font-semibold text-slate-900">
                {mockSummary.totalParticipants}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-500">Pelatih Terlibat</div>
              <div className="text-xl font-semibold text-slate-900">
                {mockSummary.totalTrainers}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-500">Observer Terlibat</div>
              <div className="text-xl font-semibold text-slate-900">
                {mockSummary.totalObservers}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-500">Cakupan Penilaian</div>
              <div className="text-xl font-semibold text-slate-900">{assessmentRate}</div>
              <div className="text-xs text-slate-500">
                {mockSummary.totalAssessedParticipants} peserta dinilai
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-500">Pengumpulan Evaluasi</div>
              <div className="text-xl font-semibold text-slate-900">{evaluationRate}</div>
              <div className="text-xs text-slate-500">
                {mockSummary.totalEvaluationsSubmitted} evaluasi masuk
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-slate-900">Daftar Peserta</h2>
            <p className="text-sm text-slate-600">Snapshot peserta terbaru.</p>
          </div>
          <div className="text-sm text-slate-600">
            Review: Pending {reviewStats.pending} · Disetujui {reviewStats.approved} · Ditolak{' '}
            {reviewStats.rejected}
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Peserta</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Review</th>
                  <th className="px-4 py-3">Terdaftar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {participants.map((item) => (
                  <tr key={item.enrollmentId} className="text-slate-700">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {item.displayName ?? item.participantName}
                    </td>
                    <td className="px-4 py-3">{item.status}</td>
                    <td className="px-4 py-3">{item.reviewStatus}</td>
                    <td className="px-4 py-3">{item.registeredAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-xs text-slate-500">
            Review enrollment digunakan sebagai kontrol administrasi, bukan keputusan kelulusan.
          </div>
        </div>

        <div className="grid gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-slate-900">Keputusan Kelulusan</h2>
            <p className="text-sm text-slate-600">
              Keputusan diambil melalui rapat panitia, bukan auto-grading.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
              <div className="text-xs text-slate-500">Lulus</div>
              <div className="text-lg font-semibold text-slate-900">
                {decisionStats.lulus}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
              <div className="text-xs text-slate-500">Tidak Lulus</div>
              <div className="text-lg font-semibold text-slate-900">
                {decisionStats.tidakLulus}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
              <div className="text-xs text-slate-500">Ditunda</div>
              <div className="text-lg font-semibold text-slate-900">
                {decisionStats.ditunda}
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Peserta</th>
                  <th className="px-4 py-3">Keputusan</th>
                  <th className="px-4 py-3">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {decisions.map((item) => (
                  <tr key={item.id} className="text-slate-700">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {item.participantName}
                    </td>
                    <td className="px-4 py-3">{item.decision}</td>
                    <td className="px-4 py-3">{item.decidedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          Evaluasi (KAP) bersifat self-assessment dan tidak mempengaruhi kelulusan.
        </div>
      </div>
    </div>
  );
}
