import { QuickAction } from '../../data/mockData';

interface QuickActionsProps {
  actions: QuickAction[];
  onActionClick?: (action: QuickAction) => void;
}

export default function QuickActions({ actions, onActionClick }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => onActionClick?.(action)}
          className="flex flex-col items-center p-5 rounded-xl cursor-pointer transition-all duration-300 text-center group border-none"
          style={{ background: '#f7fafc' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#3182ce';
            e.currentTarget.style.transform = 'translateY(-3px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f7fafc';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <i
            className="fas text-2xl mb-2.5 transition-colors duration-300"
            style={{ color: '#3182ce' }}
            ref={(el) => {
              if (el) {
                el.classList.add(action.icon);
                const parent = el.parentElement;
                if (parent) {
                  parent.addEventListener('mouseenter', () => {
                    el.style.color = 'white';
                  });
                  parent.addEventListener('mouseleave', () => {
                    el.style.color = '#3182ce';
                  });
                }
              }
            }}
          ></i>
          <span className="text-sm font-medium text-gray-700 group-hover:text-white transition-colors duration-300">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
}

// Alternative simpler version
export function QuickActionsSimple({ actions, onActionClick }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {actions.map((action) => (
        <div
          key={action.id}
          onClick={() => onActionClick?.(action)}
          className="quick-action-item flex flex-col items-center p-5 rounded-xl cursor-pointer transition-all duration-300 text-center border-none hover:bg-blue-600 hover:-translate-y-1"
          style={{ background: '#f7fafc' }}
        >
          <i
            className={`fas ${action.icon} text-2xl mb-2.5`}
            style={{ color: '#3182ce' }}
          ></i>
          <span className="text-sm font-medium text-gray-700">
            {action.label}
          </span>
          <style>{`
            .quick-action-item:hover i { color: white !important; }
            .quick-action-item:hover span { color: white !important; }
          `}</style>
        </div>
      ))}
    </div>
  );
}
