import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  HelpCircle,
  X,
  Search,
  BookOpen,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Lightbulb,
  Keyboard,
} from 'lucide-react';
import clsx from 'clsx';

interface HelpTopic {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  keywords: string[];
}

interface FAQ {
  question: string;
  answer: string;
}

interface ShortcutItem {
  keys: string[];
  description: string;
}

const helpTopics: HelpTopic[] = [
  {
    id: 'crear-iniciativa',
    title: 'Crear una nueva iniciativa',
    description: 'Cómo registrar una nueva iniciativa en el sistema',
    content: `Para crear una nueva iniciativa:

1. Ve a la sección "Iniciativas" en el menú lateral
2. Haz clic en "Nueva Iniciativa"
3. Completa el formulario con:
   - Título descriptivo
   - Descripción detallada
   - Justificación del proyecto
   - Beneficios esperados
   - Monto estimado
4. Guarda como borrador o envía para revisión`,
    category: 'Iniciativas',
    keywords: ['crear', 'nueva', 'iniciativa', 'registrar'],
  },
  {
    id: 'evaluar-iniciativa',
    title: 'Evaluar una iniciativa',
    description: 'Proceso de evaluación del comité de expertos',
    content: `El proceso de evaluación incluye:

1. Acceder a "Evaluaciones" en el menú
2. Seleccionar la iniciativa a evaluar
3. Completar la evaluación en 3 dimensiones:
   - Estratégica (claridad, beneficios, alineación)
   - Técnica (arquitectura, integración, seguridad)
   - Financiera (presupuesto, ROI, riesgos)
4. Emitir voto: Aprobar, Rechazar o Vetar
5. Agregar observaciones y recomendaciones`,
    category: 'Evaluaciones',
    keywords: ['evaluar', 'evaluación', 'comité', 'aprobar'],
  },
  {
    id: 'seguimiento-proyecto',
    title: 'Seguimiento de proyectos',
    description: 'Cómo monitorear el avance de un proyecto',
    content: `Para dar seguimiento a un proyecto:

1. Accede a "Proyectos" y selecciona uno
2. Revisa el dashboard del proyecto con:
   - Avance general (%)
   - Estado de fases
   - Presupuesto ejecutado vs planificado
   - Riesgos e issues abiertos
3. Actualiza el avance en cada fase
4. Registra en la bitácora los hitos importantes`,
    category: 'Proyectos',
    keywords: ['seguimiento', 'avance', 'monitorear', 'proyecto'],
  },
  {
    id: 'dashboard-ejecutivo',
    title: 'Dashboard Ejecutivo',
    description: 'Interpretación de métricas e indicadores',
    content: `El Dashboard Ejecutivo muestra:

- KPIs principales del portafolio
- Distribución de proyectos por estado
- Semáforo de salud (verde/amarillo/rojo)
- Ejecución presupuestaria acumulada
- Curva S de avance vs planificado
- Alertas y acciones pendientes

Usa los filtros para segmentar por año, área o estado.`,
    category: 'Dashboards',
    keywords: ['dashboard', 'ejecutivo', 'métricas', 'indicadores'],
  },
];

const faqs: FAQ[] = [
  {
    question: '¿Cómo recupero una iniciativa rechazada?',
    answer: 'Las iniciativas rechazadas no pueden recuperarse directamente. Debes crear una nueva iniciativa incorporando las observaciones del comité.',
  },
  {
    question: '¿Puedo modificar una iniciativa ya enviada?',
    answer: 'No. Una vez enviada, la iniciativa entra en el flujo de aprobación. Solo el administrador puede devolver la iniciativa a borrador.',
  },
  {
    question: '¿Qué significa el semáforo de salud del proyecto?',
    answer: 'Verde: proyecto en buen estado. Amarillo: presenta desviaciones menores. Rojo: requiere atención inmediata por desviaciones críticas.',
  },
  {
    question: '¿Cómo solicito un cambio de presupuesto?',
    answer: 'Ve a Control Presupuestario, selecciona el proyecto y usa "Solicitar Cambio". La solicitud será evaluada por el responsable asignado.',
  },
];

const shortcuts: ShortcutItem[] = [
  { keys: ['Ctrl', 'K'], description: 'Búsqueda global' },
  { keys: ['Ctrl', 'N'], description: 'Nueva iniciativa' },
  { keys: ['Ctrl', '/'], description: 'Abrir ayuda' },
  { keys: ['Esc'], description: 'Cerrar modales' },
];

const contextHelp: Record<string, { title: string; tips: string[] }> = {
  '/dashboard': {
    title: 'Dashboard Principal',
    tips: [
      'Usa los filtros para personalizar la vista',
      'Haz clic en las tarjetas para ver detalles',
      'El gráfico de semáforo muestra la salud del portafolio',
    ],
  },
  '/iniciativas': {
    title: 'Gestión de Iniciativas',
    tips: [
      'Filtra por estado para encontrar iniciativas específicas',
      'El puntaje se calcula automáticamente con el scoring',
      'Usa "Enviar" solo cuando la iniciativa esté completa',
    ],
  },
  '/proyectos': {
    title: 'Gestión de Proyectos',
    tips: [
      'El color del semáforo indica la salud del proyecto',
      'Actualiza el avance regularmente para mantener la precisión',
      'Registra riesgos e issues tan pronto los identifiques',
    ],
  },
  '/evaluaciones': {
    title: 'Panel de Evaluaciones',
    tips: [
      'Evalúa las 3 dimensiones antes de emitir tu voto',
      'El veto detiene el proceso y requiere justificación',
      'Las observaciones ayudan al demandante a mejorar',
    ],
  },
};

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpPanel({ isOpen, onClose }: HelpPanelProps) {
  const location = useLocation();
  const panelRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null);
  const [activeTab, setActiveTab] = useState<'context' | 'topics' | 'faq' | 'shortcuts'>('context');

  const currentContext = contextHelp[location.pathname];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedTopic(null);
      setSearchQuery('');
    }
  }, [isOpen]);

  const filteredTopics = searchQuery
    ? helpTopics.filter(
        (topic) =>
          topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          topic.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          topic.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : helpTopics;

  const filteredFaqs = searchQuery
    ? faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed right-4 top-[70px] w-[400px] max-h-[calc(100vh-90px)] bg-white rounded-xl shadow-xl border border-gray-200 z-50 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-accent to-primary">
          <div className="flex items-center gap-2 text-white">
            <HelpCircle className="h-5 w-5" />
            <h3 className="text-sm font-semibold">Centro de Ayuda</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="¿En qué podemos ayudarte?"
              className="w-full py-2 pl-9 pr-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'context', label: 'Contexto', icon: Lightbulb },
            { id: 'topics', label: 'Temas', icon: BookOpen },
            { id: 'faq', label: 'FAQ', icon: MessageCircle },
            { id: 'shortcuts', label: 'Atajos', icon: Keyboard },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={clsx(
                'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px',
                activeTab === tab.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {selectedTopic ? (
            <div className="p-4">
              <button
                onClick={() => setSelectedTopic(null)}
                className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 mb-3"
              >
                ← Volver
              </button>
              <h4 className="text-base font-semibold text-gray-900 mb-2">{selectedTopic.title}</h4>
              <p className="text-xs text-gray-500 mb-4">{selectedTopic.category}</p>
              <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {selectedTopic.content}
              </div>
            </div>
          ) : activeTab === 'context' ? (
            <div className="p-4">
              {currentContext ? (
                <>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">{currentContext.title}</h4>
                  <div className="space-y-2">
                    {currentContext.tips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-accent/5 rounded-lg">
                        <Lightbulb className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-700">{tip}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Lightbulb className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm">No hay ayuda contextual para esta página</p>
                </div>
              )}
            </div>
          ) : activeTab === 'topics' ? (
            <div className="divide-y divide-gray-100">
              {filteredTopics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <BookOpen className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{topic.title}</p>
                    <p className="text-xs text-gray-500 truncate">{topic.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                </button>
              ))}
            </div>
          ) : activeTab === 'faq' ? (
            <div className="p-4 space-y-3">
              {filteredFaqs.map((faq, index) => (
                <details key={index} className="group">
                  <summary className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <span className="text-sm font-medium text-gray-900 pr-2">{faq.question}</span>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="p-3 text-sm text-gray-600">{faq.answer}</div>
                </details>
              ))}
            </div>
          ) : (
            <div className="p-4">
              <p className="text-xs text-gray-500 mb-3">Atajos de teclado disponibles:</p>
              <div className="space-y-2">
                {shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex}>
                          <kbd className="px-2 py-1 text-xs font-medium bg-white border border-gray-200 rounded shadow-sm">
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="mx-0.5 text-gray-400">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <a
            href="#"
            className="flex items-center justify-center gap-2 text-xs text-accent hover:text-accent/80 font-medium transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Ver documentación completa
          </a>
        </div>
      </div>
    </>
  );
}
