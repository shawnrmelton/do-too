// frontend/src/components/Projects/ProjectsTab.jsx
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useProjects, useCreateProject } from '../../hooks/useProjects';
import ProjectCard from './ProjectCard';
import ProjectForm from './ProjectForm';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';

const ProjectsTab = () => {
  const [showNewProject, setShowNewProject] = useState(false);
  const { data: projects, isLoading, error } = useProjects();
  const createProjectMutation = useCreateProject();

  const handleCreateProject = async (projectData) => {
    try {
      await createProjectMutation.mutateAsync(projectData);
      setShowNewProject(false);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Your Projects</h2>
        <button
          onClick={() => setShowNewProject(true)}
          className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
        >
          <Plus size={18} />
          <span>Add Project</span>
        </button>
      </div>

      {showNewProject && (
        <ProjectForm
          onSubmit={handleCreateProject}
          onCancel={() => setShowNewProject(false)}
          isSubmitting={createProjectMutation.isPending}
        />
      )}

      <div className="grid gap-4 sm:gap-6">
        {projects?.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
        
        {projects?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No projects yet. Create your first project to get started!</p>
            <button
              onClick={() => setShowNewProject(true)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Add your first project
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsTab;
