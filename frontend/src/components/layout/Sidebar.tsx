import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { sidebarBadgeCounts } from '../../data/mockData';
import clsx from 'clsx';

interface SubMenuItem {
  id: string;
  name: string;
  href: string;
  icon: string;
  badge?: number | 'new';
}

interface NavSection {
  id: string;
  name: string;
  icon: string;
  colorClass: string;
  items: SubMenuItem[];
}

const navigation: NavSection[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: 'fa-th-large',
    colorClass: 'nav-icon-dashboard',
    items: [
      { id: 'vista-ejecutiva', name: 'Vista Ejecutiva', href: '/dashboard', icon: 'fa-chart-pie' },
      { id: 'portafolio', name: 'Portafolio de Proyectos', href: '/dashboards/portafolio', icon: 'fa-briefcase' },
      { id: 'planificacion-anual', name: 'Planificación Anual', href: '/plan-anual', icon: 'fa-calendar-alt' },
      { id: 'vista-financiera', name: 'Vista Financiera', href: '/dashboards/financiero', icon: 'fa-dollar-sign' },
      { id: 'gobernanza', name: 'Gobernanza', href: '/dashboards/gobernanza', icon: 'fa-sitemap' },
      { id: 'reportes', name: 'Reportes y Exportación', href: '/dashboards/reportes', icon: 'fa-file-alt' },
    ],
  },
  {
    id: 'activacion',
    name: 'Activación y Aprobación',
    icon: 'fa-rocket',
    colorClass: 'nav-icon-activacion',
    items: [
      { id: 'planificacion-estrategica', name: 'Planificación Estratégica', href: '/activacion/planificacion', icon: 'fa-flag' },
      { id: 'ingreso-requerimientos', name: 'Ingreso de Requerimientos', href: '/iniciativas/nueva', icon: 'fa-plus-circle', badge: 'new' },
      { id: 'informes-factibilidad', name: 'Informes de Factibilidad', href: '/activacion/factibilidad', icon: 'fa-file-signature', badge: 12 },
      { id: 'comite-expertos', name: 'Comité de Expertos', href: '/activacion/comite', icon: 'fa-users', badge: 8 },
      { id: 'banco-reserva', name: 'Banco de Reserva', href: '/banco-reserva', icon: 'fa-university', badge: 45 },
      { id: 'plan-anual-digital', name: 'Plan Anual Digitalización', href: '/plan-anual', icon: 'fa-calendar-check' },
      { id: 'activacion-individual', name: 'Activación Individual', href: '/activacion/individual', icon: 'fa-check-circle', badge: 3 },
      { id: 'ingreso-extraordinario', name: 'Ingreso Extraordinario', href: '/activacion/extraordinario', icon: 'fa-exclamation-triangle' },
    ],
  },
  {
    id: 'implementacion',
    name: 'Implementación',
    icon: 'fa-cogs',
    colorClass: 'nav-icon-implementacion',
    items: [
      { id: 'kick-off', name: 'Planificación / Kick Off', href: '/implementacion/kickoff', icon: 'fa-play-circle', badge: 5 },
      { id: 'analisis-diseno', name: 'Análisis y Diseño', href: '/implementacion/analisis', icon: 'fa-drafting-compass', badge: 8 },
      { id: 'construccion', name: 'Construcción', href: '/implementacion/construccion', icon: 'fa-hammer', badge: 12 },
      { id: 'pruebas', name: 'Pruebas', href: '/implementacion/pruebas', icon: 'fa-vial', badge: 4 },
      { id: 'transicion', name: 'Transición', href: '/implementacion/transicion', icon: 'fa-exchange-alt', badge: 2 },
      { id: 'go-live', name: 'Go Live y Soporte', href: '/implementacion/golive', icon: 'fa-flag-checkered', badge: 3 },
    ],
  },
  {
    id: 'seguimiento',
    name: 'Seguimiento y Control',
    icon: 'fa-chart-line',
    colorClass: 'nav-icon-seguimiento',
    items: [
      { id: 'control-presupuestario', name: 'Control Presupuestario', href: '/seguimiento/presupuesto', icon: 'fa-coins' },
      { id: 'control-planificacion', name: 'Control de Planificación', href: '/seguimiento/planificacion', icon: 'fa-tasks' },
      { id: 'gestion-riesgos', name: 'Gestión de Riesgos', href: '/seguimiento/riesgos', icon: 'fa-exclamation-circle' },
      { id: 'control-gobernanza', name: 'Control de Gobernanza', href: '/seguimiento/gobernanza', icon: 'fa-gavel' },
      { id: 'gestion-documental', name: 'Gestión Documental', href: '/seguimiento/documentos', icon: 'fa-folder-open' },
      { id: 'evaluacion-metricas', name: 'Evaluación y Métricas', href: '/seguimiento/metricas', icon: 'fa-clipboard-check' },
    ],
  },
  {
    id: 'historia',
    name: 'Historia',
    icon: 'fa-history',
    colorClass: 'nav-icon-historia',
    items: [
      { id: 'proceso-cierre', name: 'En Proceso de Cierre', href: '/historia/cierre', icon: 'fa-hourglass-half', badge: 4 },
      { id: 'proyectos-cerrados', name: 'Proyectos Cerrados', href: '/historia/cerrados', icon: 'fa-check-double', badge: 127 },
      { id: 'rechazados', name: 'Rechazados', href: '/historia/rechazados', icon: 'fa-times-circle', badge: 18 },
      { id: 'suspendidos', name: 'Suspendidos', href: '/historia/suspendidos', icon: 'fa-pause-circle', badge: 6 },
      { id: 'eliminados-banco', name: 'Eliminados del Banco', href: '/historia/eliminados', icon: 'fa-trash-alt', badge: 23 },
    ],
  },
  {
    id: 'compras',
    name: 'Gestión de Compras',
    icon: 'fa-shopping-cart',
    colorClass: 'nav-icon-compras',
    items: [
      { id: 'solicitudes-sin-contrato', name: 'Solicitudes Sin Contrato Marco', href: '/compras/solicitudes', icon: 'fa-file-invoice' },
      { id: 'evaluacion-proveedores', name: 'Evaluación de Proveedores', href: '/compras/proveedores', icon: 'fa-balance-scale' },
      { id: 'gestion-contratos', name: 'Gestión de Contratos', href: '/compras/contratos', icon: 'fa-file-contract' },
      { id: 'seguimiento-ordenes', name: 'Seguimiento de Órdenes', href: '/compras/ordenes', icon: 'fa-receipt' },
    ],
  },
  {
    id: 'configuracion',
    name: 'Configuración',
    icon: 'fa-sliders-h',
    colorClass: 'nav-icon-configuracion',
    items: [
      { id: 'catalogos-maestros', name: 'Catálogos Maestros', href: '/configuracion/catalogos', icon: 'fa-book' },
      { id: 'usuarios-permisos', name: 'Usuarios y Permisos', href: '/configuracion/usuarios', icon: 'fa-user-cog' },
      { id: 'flujos-trabajo', name: 'Flujos de Trabajo', href: '/configuracion/flujos', icon: 'fa-project-diagram' },
      { id: 'plantillas', name: 'Plantillas', href: '/configuracion/plantillas', icon: 'fa-file-code' },
      { id: 'integraciones', name: 'Integraciones', href: '/configuracion/integraciones', icon: 'fa-plug' },
    ],
  },
];

// Color styles for each section
const sectionColors: Record<string, { bg: string; color: string }> = {
  'nav-icon-dashboard': { bg: 'rgba(0, 181, 216, 0.15)', color: '#00b5d8' },
  'nav-icon-activacion': { bg: 'rgba(49, 130, 206, 0.15)', color: '#3182ce' },
  'nav-icon-implementacion': { bg: 'rgba(56, 161, 105, 0.15)', color: '#38a169' },
  'nav-icon-seguimiento': { bg: 'rgba(214, 158, 46, 0.15)', color: '#d69e2e' },
  'nav-icon-historia': { bg: 'rgba(113, 128, 150, 0.15)', color: '#718096' },
  'nav-icon-compras': { bg: 'rgba(159, 122, 234, 0.15)', color: '#9f7aea' },
  'nav-icon-configuracion': { bg: 'rgba(237, 100, 166, 0.15)', color: '#ed64a6' },
};

interface SidebarProps {
  isCollapsed: boolean;
}

export default function Sidebar({ isCollapsed }: SidebarProps) {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>('dashboard');

  // Toggle section - accordion style (only one section open at a time)
  const toggleSection = (sectionId: string) => {
    setExpandedSection(prev => prev === sectionId ? null : sectionId);
  };

  // Check if a route is active
  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  // Check if section has active item
  const isSectionActive = (section: NavSection) => {
    return section.items.some(item => isActive(item.href));
  };

  // Auto-expand section with active item
  useEffect(() => {
    const activeSection = navigation.find(s => isSectionActive(s));
    if (activeSection && expandedSection !== activeSection.id) {
      setExpandedSection(activeSection.id);
    }
  }, [location.pathname]);

  // Filter navigation based on search
  const filteredNav = navigation.map(section => {
    if (!searchQuery) return section;

    const matchingItems = section.items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sectionMatches = section.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (sectionMatches) return section;
    if (matchingItems.length > 0) {
      return { ...section, items: matchingItems };
    }
    return null;
  }).filter(Boolean) as NavSection[];

  // When searching, expand all matching sections
  useEffect(() => {
    if (searchQuery) {
      // Expand all sections when searching
    }
  }, [searchQuery]);

  return (
    <aside
      className={clsx(
        'fixed top-[60px] left-0 h-[calc(100vh-60px)] bg-white overflow-y-auto overflow-x-hidden transition-all duration-300 z-[999]',
        isCollapsed ? 'w-[60px]' : 'w-[280px]'
      )}
      style={{ boxShadow: '2px 0 10px rgba(0,0,0,0.05)' }}
    >
      {/* Sidebar Search */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200 relative">
          <i className="fas fa-search absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2.5 pl-10 pr-3 border border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      )}

      {/* Navigation */}
      <nav className={clsx('py-2.5', isCollapsed && 'pt-4')}>
        {filteredNav.map((section) => {
          const isExpanded = expandedSection === section.id || !!searchQuery;
          const sectionActive = isSectionActive(section);
          const colorStyle = sectionColors[section.colorClass];

          if (isCollapsed) {
            // Collapsed view - show only icon linking to first item
            const firstItem = section.items[0];
            return (
              <Link
                key={section.id}
                to={firstItem.href}
                className={clsx(
                  'flex items-center justify-center py-3 cursor-pointer transition-all border-l-[3px]',
                  'hover:bg-gray-50',
                  sectionActive
                    ? 'bg-gradient-to-r from-blue-50 to-transparent border-l-blue-500'
                    : 'border-transparent'
                )}
                title={section.name}
              >
                <div
                  className="w-9 h-9 flex items-center justify-center rounded-lg"
                  style={{
                    background: sectionActive ? colorStyle.bg : 'rgba(0,0,0,0.05)',
                    color: sectionActive ? colorStyle.color : '#718096'
                  }}
                >
                  <i className={`fas ${section.icon}`}></i>
                </div>
              </Link>
            );
          }

          return (
            <div key={section.id} className="mb-1">
              {/* Section Header */}
              <div
                onClick={() => toggleSection(section.id)}
                className={clsx(
                  'flex items-center py-3 px-5 cursor-pointer transition-all border-l-[3px] select-none',
                  'hover:bg-gray-50',
                  sectionActive
                    ? 'bg-gradient-to-r from-blue-50 to-transparent border-l-blue-500'
                    : 'border-transparent'
                )}
              >
                <div
                  className="w-9 h-9 flex items-center justify-center rounded-lg mr-3 flex-shrink-0 text-lg"
                  style={{
                    background: colorStyle.bg,
                    color: colorStyle.color
                  }}
                >
                  <i className={`fas ${section.icon}`}></i>
                </div>
                <span className="flex-1 text-[0.95rem] font-medium text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis">
                  {section.name}
                </span>
                <i className={clsx(
                  'fas fa-chevron-right text-gray-400 text-xs transition-transform duration-300',
                  isExpanded && 'rotate-90'
                )}></i>
              </div>

              {/* Submenu */}
              <div
                className={clsx(
                  'overflow-hidden transition-all duration-400 bg-gray-50',
                  isExpanded ? 'max-h-[1000px]' : 'max-h-0'
                )}
              >
                {section.items.map((item) => {
                  const itemActive = isActive(item.href);
                  const badge = sidebarBadgeCounts[item.id] || item.badge;

                  return (
                    <Link
                      key={item.id}
                      to={item.href}
                      className={clsx(
                        'flex items-center py-2.5 pr-5 cursor-pointer transition-all border-l-[3px] text-sm',
                        'hover:bg-gray-100 hover:text-blue-600',
                        itemActive
                          ? 'bg-gray-100 text-blue-600 border-l-blue-500 font-medium'
                          : 'text-gray-600 border-transparent'
                      )}
                      style={{ paddingLeft: '67px' }}
                    >
                      <i className={clsx(
                        `fas ${item.icon} mr-2.5 text-xs w-4 text-center`,
                        itemActive ? 'text-blue-600' : 'text-gray-400'
                      )}></i>
                      <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
                        {item.name}
                      </span>
                      {badge && (
                        <span className={clsx(
                          'ml-auto px-2 py-0.5 rounded-full text-[0.7rem] font-medium',
                          badge === 'new'
                            ? 'text-white'
                            : 'bg-gray-200 text-gray-600'
                        )}
                        style={badge === 'new' ? { background: '#63b3ed' } : undefined}
                        >
                          {badge === 'new' ? 'Nuevo' : badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
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
          <div className="text-xs text-gray-400 mt-1">v1.0 · CGE Chile · 2026</div>
        </div>
      )}
    </aside>
  );
}
