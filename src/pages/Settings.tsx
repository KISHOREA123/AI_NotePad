import React, { useState } from 'react';
import { Settings as SettingsIcon, Palette, User, Info, Sun, Moon, Monitor, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

const accentColors = [
  { name: 'Teal', value: '#0d9488' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Emerald', value: '#10b981' },
];

const Settings: React.FC = () => {
  const { theme, setTheme, accentColor, setAccentColor } = useTheme();
  const [username, setUsername] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    // Profile save logic would go here
  };

  return (
    <div className="min-h-full p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="animate-slide-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-accent-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          </div>
          <p className="text-muted-foreground">Customize your AI Notes experience</p>
        </div>

        {/* Theme Settings */}
        <section className="bg-card border border-border rounded-xl p-6 animate-slide-up" style={{ animationDelay: '50ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-accent/50 flex items-center justify-center">
              <Palette className="w-4 h-4 text-accent-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-card-foreground">Appearance</h2>
          </div>

          {/* Theme selector */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Theme</Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'light', label: 'Light', icon: Sun },
                { value: 'dark', label: 'Dark', icon: Moon },
                { value: 'system', label: 'System', icon: Monitor },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value as 'light' | 'dark' | 'system')}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                    theme === option.value
                      ? "border-primary bg-accent"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  <option.icon className={cn(
                    "w-5 h-5",
                    theme === option.value ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    "text-sm font-medium",
                    theme === option.value ? "text-accent-foreground" : "text-card-foreground"
                  )}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Accent color */}
          <div className="space-y-4 mt-6">
            <Label className="text-sm font-medium">Accent Color</Label>
            <div className="flex flex-wrap gap-3">
              {accentColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setAccentColor(color.value)}
                  className={cn(
                    "w-10 h-10 rounded-full transition-all",
                    accentColor === color.value
                      ? "ring-2 ring-offset-2 ring-offset-card ring-primary scale-110"
                      : "hover:scale-105"
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Profile Settings */}
        <section className="bg-card border border-border rounded-xl p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-accent/50 flex items-center justify-center">
              <User className="w-4 h-4 text-accent-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-card-foreground">Profile</h2>
          </div>

          <div className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  <Camera className="w-4 h-4 text-primary-foreground" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div>
                <p className="font-medium text-card-foreground">Profile Picture</p>
                <p className="text-sm text-muted-foreground">Click the camera to upload</p>
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="max-w-sm"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <Button onClick={handleSaveProfile} className="gradient-primary text-primary-foreground">
              Save Changes
            </Button>
          </div>
        </section>

        {/* App Info */}
        <section className="bg-card border border-border rounded-xl p-6 animate-slide-up" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-accent/50 flex items-center justify-center">
              <Info className="w-4 h-4 text-accent-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-card-foreground">Application Info</h2>
          </div>

          <div className="grid gap-4">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">App Name</span>
              <span className="font-medium text-card-foreground">AI Notes</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Version</span>
              <span className="font-mono text-sm text-card-foreground">1.0.0</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Build</span>
              <span className="font-mono text-sm text-card-foreground">2024.12.24</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Environment</span>
              <span className="px-2 py-1 rounded-md bg-accent text-accent-foreground text-xs font-medium">
                Production
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
