import { Button } from '@/components/ui/button';
import { Convenor, Coordinator, LinkType } from '@/lib/types/events';
import { ExternalLink, Link2, Phone, Trash2, Users } from 'lucide-react';
import Link from 'next/link';
import { AddConvenorDialog } from './AddConvenorDialog';
import { AddCoordinatorDialog } from './AddCoordinatorDialog';
import { AddLinkDialog } from './AddLinkDialog';

export function LinksAndCoordinators({
  links,
  setLinks,
  coordinators,
  setCoordinators,
  convenors,
  setConvenors,
}: {
  links: LinkType[];
  setLinks: (links: LinkType[]) => void;
  coordinators: Coordinator[];
  setCoordinators: (coordinators: Coordinator[]) => void;
  convenors: Convenor[];
  setConvenors: (convenors: Convenor[]) => void;
}) {
  const addLink = (newLink: LinkType) => {
    setLinks([...links, newLink]);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const addCoordinator = (newCoordinator: Coordinator) => {
    setCoordinators([...coordinators, newCoordinator]);
  };

  const removeCoordinator = (index: number) => {
    setCoordinators(coordinators.filter((_, i) => i !== index));
  };

  const addConvenor = (newConvenor: Convenor) => {
    setConvenors([...convenors, newConvenor]);
  };

  const removeConvenor = (index: number) => {
    setConvenors(convenors.filter((_, i) => i !== index));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Links Section */}
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10">
              <Link2 className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-medium text-white">Links</h3>
              <p className="text-sm text-zinc-500">Add relevant links</p>
            </div>
          </div>
          <AddLinkDialog addLink={addLink} />
        </div>

        {/* Links List */}
        <div className="space-y-2">
          {links.length > 0 ? (
            links.map((link, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-[#0d0d12] p-3 rounded-lg border border-white/[0.04] group hover:border-white/10 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-500/10 shrink-0">
                    <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">
                      {link.title}
                    </h4>
                    <Link
                      href={link.url}
                      target="_blank"
                      className="text-xs text-zinc-500 hover:text-blue-400 truncate block transition-colors"
                    >
                      {link.url}
                    </Link>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLink(index)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center bg-[#0d0d12] rounded-lg border border-dashed border-white/[0.06]">
              <Link2 className="w-8 h-8 text-zinc-600 mb-2" />
              <p className="text-sm text-zinc-500">No links added yet</p>
              <p className="text-xs text-zinc-600 mt-1">
                Click "Add Link" to get started
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Coordinators Section */}
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10">
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-medium text-white">Coordinators</h3>
              <p className="text-sm text-zinc-500">Manage event coordinators</p>
            </div>
          </div>
          <AddCoordinatorDialog addCoordinator={addCoordinator} />
        </div>

        {/* Coordinators List */}
        <div className="space-y-2">
          {coordinators.length > 0 ? (
            coordinators.map((coordinator, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-[#0d0d12] p-3 rounded-lg border border-white/[0.04] group hover:border-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 text-sm font-medium text-violet-300">
                    {coordinator.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">
                      {coordinator.name}
                    </h4>
                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {coordinator.phone}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCoordinator(index)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center bg-[#0d0d12] rounded-lg border border-dashed border-white/[0.06]">
              <Users className="w-8 h-8 text-zinc-600 mb-2" />
              <p className="text-sm text-zinc-500">No coordinators added yet</p>
              <p className="text-xs text-zinc-600 mt-1">
                Click "Add Coordinator" to get started
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Convenors Section */}
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/10">
              <Users className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <h3 className="text-base font-medium text-white">Convenors</h3>
              <p className="text-sm text-zinc-500">Manage event convenors</p>
            </div>
          </div>
          <AddConvenorDialog addConvenor={addConvenor} />
        </div>

        {/* Convenors List */}
        <div className="space-y-2">
          {convenors.length > 0 ? (
            convenors.map((convenor, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-[#0d0d12] p-3 rounded-lg border border-white/[0.04] group hover:border-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 text-sm font-medium text-violet-300">
                    {convenor.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">
                      {convenor.name}
                    </h4>
                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {convenor.phone}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeConvenor(index)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center bg-[#0d0d12] rounded-lg border border-dashed border-white/[0.06]">
              <Users className="w-8 h-8 text-zinc-600 mb-2" />
              <p className="text-sm text-zinc-500">No convenors added yet</p>
              <p className="text-xs text-zinc-600 mt-1">
                Click "Add Convenor" to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
