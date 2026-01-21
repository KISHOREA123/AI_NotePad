import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Greeting from '@/components/dashboard/Greeting';
import MiniCalendar from '@/components/dashboard/MiniCalendar';
import RecentNotes from '@/components/dashboard/RecentNotes';
import { useNotes } from '@/contexts/NotesContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { createNote, notes } = useNotes();

  const handleCreateNote = () => {
    createNote();
    navigate('/notes');
  };

  const totalNotes = notes.filter(n => !n.isDeleted).length;

  return (
    <div className="min-h-full p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Greeting */}
        <Greeting />

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={handleCreateNote}
            className="group p-6 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-medium transition-all duration-300 text-left animate-slide-up"
          >
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="font-semibold text-card-foreground mb-1">Create New Note</h3>
            <p className="text-sm text-muted-foreground">Start writing a new note</p>
          </button>

          <button
            onClick={() => navigate('/notes')}
            className="group p-6 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-medium transition-all duration-300 text-left animate-slide-up"
            style={{ animationDelay: '50ms' }}
          >
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-accent-foreground" />
            </div>
            <h3 className="font-semibold text-card-foreground mb-1">Browse Notes</h3>
            <p className="text-sm text-muted-foreground">{totalNotes} notes in your library</p>
          </button>

          <button
            onClick={() => navigate('/settings')}
            className="group p-6 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-medium transition-all duration-300 text-left animate-slide-up sm:col-span-2 lg:col-span-1"
            style={{ animationDelay: '100ms' }}
          >
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ArrowRight className="w-6 h-6 text-secondary-foreground" />
            </div>
            <h3 className="font-semibold text-card-foreground mb-1">Get Started</h3>
            <p className="text-sm text-muted-foreground">Customize your experience</p>
          </button>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent notes */}
          <div className="lg:col-span-2">
            <RecentNotes />
          </div>

          {/* Calendar */}
          <div className="lg:col-span-1">
            <MiniCalendar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
