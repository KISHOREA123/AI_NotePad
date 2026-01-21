import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Trash2, 
  Settings, 
  Menu,
  X,
  Sparkles,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  User,
  Briefcase,
  Lightbulb,
  FolderKanban,
  LogOut,
  Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useNotes } from '@/contexts/NotesContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import QuickNoteButton from '@/components/QuickNoteButton';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  User,
  Briefcase,
  Lightbulb,
  FolderKanban,
};

const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { folders, activeFolder, setActiveFolder, getNotesForFolder, getDeletedNotes } = useNotes();
  const { user, signOut } = useAuth();

  const isNotesRoute = location.pathname === '/notes';

  const handleFolderClick = (folderId: string) => {
    setActiveFolder(folderId);
    setSidebarOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out lg:transform-none flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">AI Notes</span>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden ml-auto"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-auto scrollbar-thin">
          {/* Dashboard */}
          <NavLink
            to="/"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )
            }
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </NavLink>

          {/* Notes with dropdown */}
          <Collapsible open={notesExpanded} onOpenChange={setNotesExpanded}>
            <div className="space-y-1">
              <div className="flex items-center">
                <NavLink
                  to="/notes"
                  onClick={() => {
                    setSidebarOpen(false);
                    setActiveFolder('all');
                  }}
                  className={({ isActive }) =>
                    cn(
                      "flex-1 flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )
                  }
                >
                  <FileText className="w-5 h-5" />
                  Notes
                </NavLink>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 mr-1"
                  >
                    {notesExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent className="pl-4 space-y-1 animate-accordion-down">
                {/* All Notes */}
                <button
                  onClick={() => {
                    handleFolderClick('all');
                    if (location.pathname !== '/notes') {
                      window.location.href = '/notes';
                    }
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isNotesRoute && activeFolder === 'all'
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <FolderOpen className="w-4 h-4" />
                  <span className="flex-1 text-left">All Notes</span>
                  <span className="text-xs text-muted-foreground">
                    {getNotesForFolder('all').length}
                  </span>
                </button>

                {/* Folders */}
                {folders.map((folder) => {
                  const Icon = iconMap[folder.icon] || FileText;
                  const noteCount = getNotesForFolder(folder.id).length;

                  return (
                    <button
                      key={folder.id}
                      onClick={() => {
                        handleFolderClick(folder.id);
                        if (location.pathname !== '/notes') {
                          window.location.href = '/notes';
                        }
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                        isNotesRoute && activeFolder === folder.id
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                      )}
                    >
                      <div
                        className="w-4 h-4 rounded flex items-center justify-center"
                        style={{ backgroundColor: folder.color + '20' }}
                      >
                        <Icon className="w-3 h-3" style={{ color: folder.color }} />
                      </div>
                      <span className="flex-1 text-left">{folder.name}</span>
                      <span className="text-xs text-muted-foreground">{noteCount}</span>
                    </button>
                  );
                })}
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* AI Assistant */}
          <NavLink
            to="/ai-assistant"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )
            }
          >
            <Bot className="w-5 h-5" />
            AI Assistant
          </NavLink>

          {/* Recycle Bin */}
          <NavLink
            to="/trash"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )
            }
          >
            <Trash2 className="w-5 h-5" />
            <span className="flex-1">Recycle Bin</span>
            <span className="text-xs text-muted-foreground">
              {getDeletedNotes().length}
            </span>
          </NavLink>

          {/* Settings */}
          <NavLink
            to="/settings"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )
            }
          >
            <Settings className="w-5 h-5" />
            Settings
          </NavLink>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border space-y-2">
          {user && (
            <div className="px-4 py-2 text-xs text-muted-foreground truncate">
              {user.email}
            </div>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-4 text-sm text-muted-foreground hover:text-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden h-16 border-b border-border flex items-center px-4 bg-card">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 ml-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-semibold">AI Notes</span>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>

      {/* Floating Quick Note Button - Hide on AI Assistant page */}
      {location.pathname !== '/ai-assistant' && <QuickNoteButton />}
    </div>
  );
};

export default AppLayout;
