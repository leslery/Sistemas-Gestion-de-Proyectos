import { useState, createContext, useContext, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

interface AccordionContextType {
  openItems: string[];
  toggleItem: (id: string) => void;
  type: 'single' | 'multiple';
}

const AccordionContext = createContext<AccordionContextType | null>(null);

interface AccordionProps {
  children: ReactNode;
  type?: 'single' | 'multiple';
  defaultOpen?: string[];
  className?: string;
}

export function Accordion({ children, type = 'single', defaultOpen = [], className }: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen);

  const toggleItem = (id: string) => {
    if (type === 'single') {
      setOpenItems(openItems.includes(id) ? [] : [id]);
    } else {
      setOpenItems(
        openItems.includes(id)
          ? openItems.filter((item) => item !== id)
          : [...openItems, id]
      );
    }
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, type }}>
      <div className={clsx('divide-y divide-gray-200 border border-gray-200 rounded-lg', className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function AccordionItem({ value, children, className }: AccordionItemProps) {
  return (
    <div className={clsx('', className)} data-value={value}>
      {children}
    </div>
  );
}

interface AccordionTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function AccordionTrigger({ value, children, className }: AccordionTriggerProps) {
  const context = useContext(AccordionContext);
  if (!context) throw new Error('AccordionTrigger must be used within Accordion');

  const { openItems, toggleItem } = context;
  const isOpen = openItems.includes(value);

  return (
    <button
      type="button"
      onClick={() => toggleItem(value)}
      className={clsx(
        'flex items-center justify-between w-full px-4 py-3 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors',
        className
      )}
      aria-expanded={isOpen}
    >
      {children}
      <ChevronDown
        className={clsx(
          'h-4 w-4 text-gray-500 transition-transform duration-200',
          isOpen && 'rotate-180'
        )}
      />
    </button>
  );
}

interface AccordionContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function AccordionContent({ value, children, className }: AccordionContentProps) {
  const context = useContext(AccordionContext);
  if (!context) throw new Error('AccordionContent must be used within Accordion');

  const { openItems } = context;
  const isOpen = openItems.includes(value);

  if (!isOpen) return null;

  return (
    <div className={clsx('px-4 pb-4 text-sm text-gray-600', className)}>
      {children}
    </div>
  );
}
