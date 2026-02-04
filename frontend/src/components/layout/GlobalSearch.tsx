import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Command,
  LayoutDashboard,
  Lightbulb,
  FolderKanban,
  User,
  ArrowRight,
  FileText,
} from 'lucide-react';
import clsx from 'clsx';
import { useGlobalSearch, SearchResultType, SearchResult } from '../../hooks/useGlobalSearch';

const typeIcons: Record<SearchResultType, typeof Search> = {
  page: LayoutDashboard,
  iniciativa: Lightbulb,
  proyecto: FolderKanban,
  usuario: User,
};

const typeLabels: Record<SearchResultType, string> = {
  page: 'Página',
  iniciativa: 'Iniciativa',
  proyecto: 'Proyecto',
  usuario: 'Usuario',
};

const typeColors: Record<SearchResultType, string> = {
  page: 'bg-gray-100 text-gray-600',
  iniciativa: 'bg-amber-100 text-amber-700',
  proyecto: 'bg-blue-100 text-blue-700',
  usuario: 'bg-purple-100 text-purple-700',
};

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const {
    query,
    setQuery,
    results,
    isLoading,
    selectedIndex,
    setSelectedIndex,
    clearResults,
  } = useGlobalSearch();

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      clearResults();
    }
  }, [isOpen, setQuery, clearResults]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(Math.min(selectedIndex + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(Math.max(selectedIndex - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, setSelectedIndex, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current && results.length > 0) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      selectedElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, results.length]);

  const handleSelect = (result: SearchResult) => {
    navigate(result.link);
    onClose();
  };

  if (!isOpen) return null;

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<SearchResultType, SearchResult[]>);

  const orderedTypes: SearchResultType[] = ['page', 'iniciativa', 'proyecto', 'usuario'];
  let flatIndex = 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[1001] animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-[600px] z-[1002] animate-in zoom-in-95 fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
            <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar proyectos, iniciativas, páginas..."
              className="flex-1 text-base text-gray-900 placeholder-gray-400 outline-none"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  clearResults();
                  inputRef.current?.focus();
                }}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-500">
              <span>ESC</span>
            </div>
          </div>

          {/* Results */}
          <div ref={resultsRef} className="max-h-[400px] overflow-y-auto">
            {isLoading && query ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent" />
              </div>
            ) : query && results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <FileText className="h-10 w-10 text-gray-300 mb-2" />
                <p className="text-sm">No se encontraron resultados</p>
                <p className="text-xs text-gray-400 mt-1">Intenta con otros términos</p>
              </div>
            ) : !query ? (
              <div className="p-4">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                  Acceso rápido
                </p>
                <div className="space-y-1">
                  {[
                    { title: 'Dashboard', link: '/dashboard', icon: LayoutDashboard },
                    { title: 'Iniciativas', link: '/iniciativas', icon: Lightbulb },
                    { title: 'Proyectos', link: '/proyectos', icon: FolderKanban },
                  ].map((item) => (
                    <button
                      key={item.link}
                      onClick={() => {
                        navigate(item.link);
                        onClose();
                      }}
                      className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
                    >
                      <item.icon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{item.title}</span>
                      <ArrowRight className="h-4 w-4 text-gray-300 ml-auto" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-2">
                {orderedTypes.map((type) => {
                  const typeResults = groupedResults[type];
                  if (!typeResults?.length) return null;

                  const TypeIcon = typeIcons[type];

                  return (
                    <div key={type} className="mb-2">
                      <p className="px-4 py-1 text-xs font-medium text-gray-400 uppercase tracking-wide">
                        {typeLabels[type]}s
                      </p>
                      {typeResults.map((result) => {
                        const currentIndex = flatIndex++;
                        const isSelected = currentIndex === selectedIndex;
                        const Icon = typeIcons[result.type];

                        return (
                          <button
                            key={result.id}
                            onClick={() => handleSelect(result)}
                            onMouseEnter={() => setSelectedIndex(currentIndex)}
                            className={clsx(
                              'flex items-center gap-3 w-full px-4 py-2.5 transition-colors text-left',
                              isSelected ? 'bg-accent/10' : 'hover:bg-gray-50'
                            )}
                          >
                            <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', typeColors[result.type])}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={clsx(
                                'text-sm font-medium truncate',
                                isSelected ? 'text-accent' : 'text-gray-900'
                              )}>
                                {result.title}
                              </p>
                              {result.subtitle && (
                                <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                              )}
                            </div>
                            {isSelected && (
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <span>Enter</span>
                                <ArrowRight className="h-3 w-3" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded">↓</kbd>
                <span className="ml-1">Navegar</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded">↵</kbd>
                <span className="ml-1">Seleccionar</span>
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Command className="h-3 w-3" />
              <span>+K para abrir</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
