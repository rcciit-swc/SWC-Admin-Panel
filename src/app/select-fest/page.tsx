'use client';
import { useFests } from '@/lib/stores/fests';
import { checkFestHasEvents } from '@/utils/functions/festUtils';
import { Calendar, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const FestSelectionCard = ({
  id,
  name,
  year,
  fest_logo,
}: {
  id: string;
  name: string;
  year: number;
  fest_logo: string | null;
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    try {
      setIsLoading(true);
      const hasEvents = await checkFestHasEvents(id);
      if (hasEvents) {
        router.push(`/admin/${id}`);
      } else {
        router.push('/coming-soon');
      }
    } catch (error) {
      console.error('Error in fest selection:', error);
      setIsLoading(false);
    }
  };

  return (
    <div
      onClick={!isLoading ? handleClick : undefined}
      className={`group relative h-full bg-gradient-to-br from-violet-950/40 to-indigo-950/40 border border-white/10 rounded-2xl p-8 hover:border-violet-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/20 cursor-pointer ${
        isLoading ? 'opacity-70 pointer-events-none' : ''
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-indigo-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        {fest_logo ? (
          <div className="w-24 h-24 bg-gradient-to-br from-violet-600/20 to-indigo-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 overflow-hidden">
            <Image
              src={fest_logo}
              alt={name}
              width={96}
              height={96}
              className="object-cover w-full h-full"
            />
          </div>
        ) : (
          <div className="w-24 h-24 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            {isLoading ? (
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            ) : (
              <Calendar className="w-12 h-12 text-white" />
            )}
          </div>
        )}

        <h2 className="text-2xl font-bold text-white mb-3">{name}</h2>

        <p className="text-zinc-400 mb-6">Year: {year}</p>

        <div className="text-violet-400 font-medium group-hover:text-violet-300 transition-colors flex items-center gap-2">
          {isLoading ? 'Checking...' : 'Manage Events →'}
        </div>
      </div>
    </div>
  );
};

const SelectFestPage = () => {
  const router = useRouter();
  const { fests, festsLoading, getFests } = useFests();

  useEffect(() => {
    getFests();
  }, [getFests]);

  if (festsLoading) {
    return (
      <div className="min-h-screen w-full bg-[#050508] flex items-center justify-center">
        <div className="fixed inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-indigo-950/10 pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-violet-400 animate-spin" />
          <p className="text-zinc-400 text-lg">Loading fests...</p>
        </div>
      </div>
    );
  }

  if (!fests || fests.length === 0) {
    return (
      <div className="min-h-screen w-full bg-[#050508] flex items-center justify-center">
        <div className="fixed inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-indigo-950/10 pointer-events-none" />
        <div className="relative z-10 container max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            No Fests Available
          </h1>
          <p className="text-zinc-400 text-lg mb-8">
            There are no fests available for 2026 at the moment.
          </p>
          <button
            onClick={() => router.push('/landing')}
            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:from-violet-500 hover:to-indigo-500 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#050508]">
      <div className="fixed inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-indigo-950/10 pointer-events-none" />

      <div className="relative z-10 container max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Select a Fest
          </h1>
          <p className="text-zinc-400 text-lg">
            Choose a fest to manage its events
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fests.map((fest) => (
            <FestSelectionCard
              key={fest.id}
              id={fest.id}
              name={fest.name}
              year={fest.year}
              fest_logo={fest.fest_logo}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectFestPage;
