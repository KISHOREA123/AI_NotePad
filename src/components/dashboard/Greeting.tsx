import React, { useState, useEffect } from 'react';
import { Sun, Moon, Sunset } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Greeting: React.FC = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return { text: 'Good Morning', icon: Sun };
    if (hour < 17) return { text: 'Good Afternoon', icon: Sun };
    if (hour < 21) return { text: 'Good Evening', icon: Sunset };
    return { text: 'Good Night', icon: Moon };
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const greeting = getGreeting();
  const Icon = greeting.icon;

  return (
    <div className="animate-slide-up">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
          <Icon className="w-5 h-5 text-accent-foreground" />
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
          {greeting.text}{user?.user_metadata?.display_name ? `, ${user.user_metadata.display_name}` : ''}
        </h1>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-muted-foreground">
        <span className="text-sm">{formatDate()}</span>
        <span className="hidden sm:block">•</span>
        <span className="text-sm font-mono">{formatTime()}</span>
      </div>
    </div>
  );
};

export default Greeting;
