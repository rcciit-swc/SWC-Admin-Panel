import { ArrowLeft, Rocket } from 'lucide-react';
import Link from 'next/link';

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen w-full bg-[#050508] flex items-center justify-center relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-indigo-950/10 pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />

      <div className="relative z-10 container max-w-2xl mx-auto px-4 text-center">
        {/* Icon & Glow */}
        <div className="mb-8 relative inline-flex">
          <div className="absolute inset-0 bg-violet-500/20 blur-2xl rounded-full" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-violet-600/20 to-indigo-600/20 rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl shadow-violet-500/10">
            <Rocket className="w-10 h-10 text-violet-400" />
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-violet-200 to-indigo-200 mb-6 tracking-tight">
          Coming Soon
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-lg mx-auto leading-relaxed">
          We're checking the engines and polishing the hull. This fest is
          preparing for launch! Check back soon.
        </p>

        {/* Action Button */}
        <Link
          href="/select-fest"
          className="group relative inline-flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-semibold transition-all duration-300 border border-white/10 hover:border-violet-500/30 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
          <span>Back to Selection</span>
        </Link>
      </div>
    </div>
  );
}
