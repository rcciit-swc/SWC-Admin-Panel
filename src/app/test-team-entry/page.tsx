import TeamEntryForm from '@/components/TeamEntryForm';

const TestTeamEntryPage = () => {
  return (
    <div className="min-h-screen w-full bg-[#050508]">
      <div className="fixed inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-indigo-950/10 pointer-events-none" />
      <main className="relative container max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-white text-2xl mb-4">Test Team Entry</h1>
        <TeamEntryForm
          userId="123e4567-e89b-12d3-a456-426614174000"
          isSuperAdmin={true}
        />
      </main>
    </div>
  );
};

export default TestTeamEntryPage;
