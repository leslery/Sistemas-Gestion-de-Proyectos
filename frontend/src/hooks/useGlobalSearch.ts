import { useState, useCallback, useEffect } from 'react';
import { iniciativasService, proyectosService, usuariosService } from '../services/api';

export type SearchResultType = 'iniciativa' | 'proyecto' | 'usuario' | 'page';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  link: string;
  icon?: string;
}

interface UseGlobalSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  isLoading: boolean;
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  search: (query: string) => Promise<void>;
  clearResults: () => void;
}

// Static pages for quick navigation
const staticPages: SearchResult[] = [
  { id: 'page-dashboard', type: 'page', title: 'Dashboard', subtitle: 'Panel principal', link: '/dashboard' },
  { id: 'page-dashboard-exec', type: 'page', title: 'Dashboard Ejecutivo', subtitle: 'Vista ejecutiva', link: '/dashboard-ejecutivo' },
  { id: 'page-portafolio', type: 'page', title: 'Portafolio', subtitle: 'Dashboard de portafolio', link: '/dashboards/portafolio' },
  { id: 'page-financiero', type: 'page', title: 'Financiero', subtitle: 'Dashboard financiero', link: '/dashboards/financiero' },
  { id: 'page-pipeline', type: 'page', title: 'Pipeline', subtitle: 'Pipeline de iniciativas', link: '/pipeline' },
  { id: 'page-iniciativas', type: 'page', title: 'Iniciativas', subtitle: 'Gestión de iniciativas', link: '/iniciativas' },
  { id: 'page-evaluaciones', type: 'page', title: 'Evaluaciones', subtitle: 'Evaluaciones del comité', link: '/evaluaciones' },
  { id: 'page-proyectos', type: 'page', title: 'Proyectos', subtitle: 'Gestión de proyectos', link: '/proyectos' },
  { id: 'page-banco', type: 'page', title: 'Banco de Reserva', subtitle: 'Proyectos en reserva', link: '/banco-reserva' },
  { id: 'page-plan', type: 'page', title: 'Plan Anual', subtitle: 'Planificación anual', link: '/plan-anual' },
  { id: 'page-presupuesto', type: 'page', title: 'Control Presupuestario', subtitle: 'Seguimiento financiero', link: '/seguimiento/presupuesto' },
  { id: 'page-riesgos', type: 'page', title: 'Gestión de Riesgos', subtitle: 'Control de riesgos', link: '/seguimiento/riesgos' },
  { id: 'page-config', type: 'page', title: 'Configuración', subtitle: 'Ajustes del sistema', link: '/configuracion' },
];

export function useGlobalSearch(): UseGlobalSearchReturn {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const clearResults = useCallback(() => {
    setResults([]);
    setSelectedIndex(0);
  }, []);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      clearResults();
      return;
    }

    setIsLoading(true);
    const searchLower = searchQuery.toLowerCase();

    try {
      // Search static pages first (instant)
      const pageResults = staticPages.filter(
        (page) =>
          page.title.toLowerCase().includes(searchLower) ||
          page.subtitle?.toLowerCase().includes(searchLower)
      );

      // Set page results immediately
      setResults(pageResults);

      // Search API in parallel
      const [iniciativas, proyectos, usuarios] = await Promise.allSettled([
        iniciativasService.getAll({ search: searchQuery, limit: 5 }),
        proyectosService.getAll({ search: searchQuery, limit: 5 }),
        usuariosService.getAll({ search: searchQuery, limit: 5 }),
      ]);

      const apiResults: SearchResult[] = [];

      // Process iniciativas
      if (iniciativas.status === 'fulfilled' && Array.isArray(iniciativas.value)) {
        iniciativas.value.forEach((item: any) => {
          apiResults.push({
            id: `iniciativa-${item.id}`,
            type: 'iniciativa',
            title: item.titulo || item.nombre,
            subtitle: `${item.codigo} · ${item.estado}`,
            link: `/iniciativas/${item.id}`,
          });
        });
      }

      // Process proyectos
      if (proyectos.status === 'fulfilled' && Array.isArray(proyectos.value)) {
        proyectos.value.forEach((item: any) => {
          apiResults.push({
            id: `proyecto-${item.id}`,
            type: 'proyecto',
            title: item.nombre || item.titulo,
            subtitle: `${item.codigo_proyecto} · ${item.estado}`,
            link: `/proyectos/${item.id}`,
          });
        });
      }

      // Process usuarios
      if (usuarios.status === 'fulfilled' && Array.isArray(usuarios.value)) {
        usuarios.value.forEach((item: any) => {
          apiResults.push({
            id: `usuario-${item.id}`,
            type: 'usuario',
            title: `${item.nombre} ${item.apellido}`,
            subtitle: `${item.email} · ${item.rol}`,
            link: `/configuracion`,
          });
        });
      }

      // Combine and sort results
      setResults([...pageResults, ...apiResults]);
      setSelectedIndex(0);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [clearResults]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      search(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, search]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    selectedIndex,
    setSelectedIndex,
    search,
    clearResults,
  };
}
