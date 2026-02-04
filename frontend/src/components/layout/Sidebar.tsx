import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore, isJefeTD, isComite, isCGEDx, isAdmin } from '../../store/authStore';
import {
  LayoutDashboard,
  BarChart3,
  PieChart,
  DollarSign,
  Users,
  FileBarChart,
  GitBranch,
  Lightbulb,
  ClipboardCheck,
  Target,
  FileText,
  UserCheck,
  Zap,
  AlertCircle,
  FolderKanban,
  Rocket,
  Compass,
  Hammer,
  TestTube,
  ArrowRightLeft,
  PlayCircle,
  Activity,
  Calculator,
  CalendarClock,
  AlertTriangle,
  Shield,
  FileArchive,
  LineChart,
  Archive,
  CheckCircle2,
  XCircle,
  Calendar,
  ShoppingCart,
  FileQuestion,
  Star,
  FileSignature,
  ClipboardList,
  Settings,
  Workflow,
  LayoutTemplate,
  Plug,
  ChevronRight,
  ChevronDown,
  Search,
  type LucideIcon
} from 'lucide-react';
import clsx from 'clsx';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

interface NavSection {
  name: string;
  icon: LucideIcon;
  roles: ('all' | 'admin' | 'td' | 'comite' | 'executive' | 'demandante')[];
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    name: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['all'],
    items: [
      { name: 'Dashboard Principal', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Dashboard Ejecutivo', href: '/dashboard-ejecutivo', icon: BarChart3 },
      { name: 'Portafolio', href: '/dashboards/portafolio', icon: PieChart },
      { name: 'Financiero', href: '/dashboards/financiero', icon: DollarSign },
      { name: 'Gobernanza', href: '/dashboards/gobernanza', icon: Users },
      { name: 'Centro de Reportes', href: '/dashboards/reportes', icon: FileBarChart },
    ],
  },
  {
    name: 'Activación y Aprobación',
    icon: Lightbulb,
    roles: ['all'],
    items: [
      { name: 'Pipeline', href: '/pipeline', icon: GitBranch },
      { name: 'Iniciativas', href: '/iniciativas', icon: Lightbulb },
      { name: 'Evaluaciones', href: '/evaluaciones', icon: ClipboardCheck },
      { name: 'Planificación Estratégica', href: '/activacion/planificacion', icon: Target },
      { name: 'Informe Factibilidad', href: '/activacion/factibilidad', icon: FileText },
      { name: 'Comité de Expertos', href: '/activacion/comite', icon: UserCheck },
      { name: 'Activación Individual', href: '/activacion/individual', icon: Zap },
      { name: 'Ingreso Extraordinario', href: '/activacion/extraordinario', icon: AlertCircle },
    ],
  },
  {
    name: 'Implementación',
    icon: FolderKanban,
    roles: ['td', 'admin'],
    items: [
      { name: 'Proyectos', href: '/proyectos', icon: FolderKanban },
      { name: 'Kick-Off', href: '/implementacion/kickoff', icon: Rocket },
      { name: 'Análisis y Diseño', href: '/implementacion/analisis', icon: Compass },
      { name: 'Construcción', href: '/implementacion/construccion', icon: Hammer },
      { name: 'Pruebas', href: '/implementacion/pruebas', icon: TestTube },
      { name: 'Transición', href: '/implementacion/transicion', icon: ArrowRightLeft },
      { name: 'Go-Live', href: '/implementacion/golive', icon: PlayCircle },
    ],
  },
  {
    name: 'Seguimiento y Control',
    icon: Activity,
    roles: ['td', 'admin', 'executive'],
    items: [
      { name: 'Control Presupuestario', href: '/seguimiento/presupuesto', icon: Calculator },
      { name: 'Control Planificación', href: '/seguimiento/planificacion', icon: CalendarClock },
      { name: 'Gestión de Riesgos', href: '/seguimiento/riesgos', icon: AlertTriangle },
      { name: 'Control Gobernanza', href: '/seguimiento/gobernanza', icon: Shield },
      { name: 'Gestión Documental', href: '/seguimiento/documentos', icon: FileArchive },
      { name: 'Evaluación y Métricas', href: '/seguimiento/metricas', icon: LineChart },
    ],
  },
  {
    name: 'Historia',
    icon: Archive,
    roles: ['td', 'admin'],
    items: [
      { name: 'Banco de Reserva', href: '/banco-reserva', icon: Archive },
      { name: 'Plan Anual', href: '/plan-anual', icon: Calendar },
      { name: 'Proceso de Cierre', href: '/historia/cierre', icon: CheckCircle2 },
      { name: 'Proyectos Cerrados', href: '/historia/cerrados', icon: Archive },
      { name: 'Proyectos Rechazados', href: '/historia/rechazados', icon: XCircle },
    ],
  },
  {
    name: 'Gestión de Compras',
    icon: ShoppingCart,
    roles: ['td', 'admin'],
    items: [
      { name: 'Solicitudes Sin Contrato', href: '/compras/solicitudes', icon: FileQuestion },
      { name: 'Evaluación Proveedores', href: '/compras/proveedores', icon: Star },
      { name: 'Contratos', href: '/compras/contratos', icon: FileSignature },
      { name: 'Órdenes', href: '/compras/ordenes', icon: ClipboardList },
    ],
  },
  {
    name: 'Configuración',
    icon: Settings,
    roles: ['admin'],
    items: [
      { name: 'General', href: '/configuracion', icon: Settings },
      { name: 'Flujos de Trabajo', href: '/configuracion/flujos', icon: Workflow },
      { name: 'Plantillas', href: '/configuracion/plantillas', icon: LayoutTemplate },
      { name: 'Integraciones', href: '/configuracion/integraciones', icon: Plug },
    ],
  },
];

interface SidebarProps {
  isCollapsed: boolean;
}

export default function Sidebar({ isCollapsed }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>(['Dashboard']);

  const toggleSection = (sectionName: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionName)
        ? prev.filter((s) => s !== sectionName)
        : [...prev, sectionName]
    );
  };

  const canViewSection = (roles: string[]): boolean => {
    if (roles.includes('all')) return true;
    if (roles.includes('admin') && isAdmin(user)) return true;
    if (roles.includes('td') && isJefeTD(user)) return true;
    if (roles.includes('comite') && isComite(user)) return true;
    if (roles.includes('executive') && (isJefeTD(user) || isCGEDx(user))) return true;
    if (roles.includes('demandante') && user?.rol === 'demandante') return true;
    return false;
  };

  const filteredNav = navigation.filter((section) => {
    if (!canViewSection(section.roles)) return false;

    if (searchQuery) {
      const hasMatchingItem = section.items.some(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          section.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return hasMatchingItem;
    }

    return true;
  });

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const isSectionActive = (section: NavSection) => {
    return section.items.some((item) => isActive(item.href));
  };

  // Auto-expand section with active item
  const activeSectionName = navigation.find((s) => isSectionActive(s))?.name;
  if (activeSectionName && !expandedSections.includes(activeSectionName)) {
    setExpandedSections((prev) => [...prev, activeSectionName]);
  }

  return (
    <aside
      className={clsx(
        'fixed top-[60px] left-0 h-[calc(100vh-60px)] bg-white shadow-md overflow-y-auto overflow-x-hidden transition-all duration-300 z-[999]',
        isCollapsed ? 'w-[60px]' : 'w-[280px]'
      )}
    >
      {/* Sidebar Search */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar menú..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2.5 pl-9 pr-3 border border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className={clsx('py-2.5', isCollapsed && 'pt-4')}>
        {filteredNav.map((section) => {
          const SectionIcon = section.icon;
          const isExpanded = expandedSections.includes(section.name) || !!searchQuery;
          const sectionActive = isSectionActive(section);

          // Filter items based on search
          const visibleItems = searchQuery
            ? section.items.filter(
                (item) =>
                  item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  section.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
            : section.items;

          if (isCollapsed) {
            // Collapsed view - show only first item icon
            const firstItem = section.items[0];
            return (
              <Link
                key={section.name}
                to={firstItem.href}
                className={clsx(
                  'flex items-center justify-center py-3 cursor-pointer transition-all border-l-[3px] border-transparent',
                  'hover:bg-gray-50',
                  sectionActive && 'bg-gradient-to-r from-accent/10 to-transparent border-l-accent'
                )}
                title={section.name}
              >
                <div
                  className={clsx(
                    'w-9 h-9 flex items-center justify-center rounded-lg flex-shrink-0',
                    sectionActive ? 'bg-accent/15 text-accent' : 'bg-gray-100 text-gray-500'
                  )}
                >
                  <SectionIcon className="h-5 w-5" />
                </div>
              </Link>
            );
          }

          return (
            <div key={section.name} className="mb-1">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.name)}
                className={clsx(
                  'w-full flex items-center py-3 px-5 cursor-pointer transition-all',
                  'hover:bg-gray-50',
                  sectionActive && 'bg-gradient-to-r from-accent/5 to-transparent'
                )}
              >
                <div
                  className={clsx(
                    'w-9 h-9 flex items-center justify-center rounded-lg flex-shrink-0 mr-3',
                    sectionActive ? 'bg-accent/15 text-accent' : 'bg-gray-100 text-gray-500'
                  )}
                >
                  <SectionIcon className="h-5 w-5" />
                </div>
                <span
                  className={clsx(
                    'flex-1 text-[0.95rem] font-medium text-left whitespace-nowrap overflow-hidden text-ellipsis',
                    sectionActive ? 'text-accent' : 'text-gray-700'
                  )}
                >
                  {section.name}
                </span>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </button>

              {/* Section Items */}
              {isExpanded && (
                <div className="ml-4 pl-4 border-l border-gray-200">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={clsx(
                          'flex items-center py-2.5 px-3 cursor-pointer transition-all rounded-lg mx-2 my-0.5',
                          'hover:bg-gray-100',
                          active && 'bg-accent/10 text-accent'
                        )}
                      >
                        <Icon
                          className={clsx(
                            'h-4 w-4 mr-3 flex-shrink-0',
                            active ? 'text-accent' : 'text-gray-400'
                          )}
                        />
                        <span
                          className={clsx(
                            'text-sm whitespace-nowrap overflow-hidden text-ellipsis',
                            active ? 'text-accent font-medium' : 'text-gray-600'
                          )}
                        >
                          {item.name}
                        </span>
                        {item.badge && (
                          <span className="ml-auto px-2 py-0.5 rounded-full text-[0.7rem] font-medium bg-accent/10 text-accent">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="text-xs text-gray-500">
            Sistema de Gestión de
            <br />
            Iniciativas y Proyectos
          </div>
          <div className="text-xs text-gray-400 mt-1">v2.0.0 · CGE Chile</div>
        </div>
      )}
    </aside>
  );
}
