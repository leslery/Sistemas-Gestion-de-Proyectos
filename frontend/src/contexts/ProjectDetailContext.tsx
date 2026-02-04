import { createContext, useContext, useState, ReactNode } from 'react';
import ProjectDetailModal from '../components/ui/ProjectDetailModal';

interface ProjectForModal {
  id: string;
  title?: string;
  [key: string]: any;
}

interface ProjectDetailContextType {
  openProjectDetail: (project: ProjectForModal) => void;
  closeProjectDetail: () => void;
  isOpen: boolean;
}

const ProjectDetailContext = createContext<ProjectDetailContextType | null>(null);

export function useProjectDetail() {
  const context = useContext(ProjectDetailContext);
  if (!context) {
    throw new Error('useProjectDetail must be used within a ProjectDetailProvider');
  }
  return context;
}

interface ProjectDetailProviderProps {
  children: ReactNode;
}

export function ProjectDetailProvider({ children }: ProjectDetailProviderProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectForModal | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openProjectDetail = (project: ProjectForModal) => {
    setSelectedProject(project);
    setIsOpen(true);
  };

  const closeProjectDetail = () => {
    setIsOpen(false);
    setSelectedProject(null);
  };

  return (
    <ProjectDetailContext.Provider value={{ openProjectDetail, closeProjectDetail, isOpen }}>
      {children}
      <ProjectDetailModal
        project={selectedProject as any}
        isOpen={isOpen}
        onClose={closeProjectDetail}
      />
    </ProjectDetailContext.Provider>
  );
}
