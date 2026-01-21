import React, { useState } from 'react';
import { Wand2, Loader2, CheckCircle, Type, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { transformersAI } from '@/services/transformersAI';

interface AIWritingAssistantProps {
  onApply: (text: string) => void;
  selectedText: string;
}

const AIWritingAssistant: React.FC<AIWritingAssistantProps> = ({ onApply, selectedText }) => {
  const [loading, setLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  const handleAIAction = async (type: string, instruction?: string) => {
    if (!selectedText && type !== 'assist') {
      console.log('Please select some text first');
      return;
    }

    setLoading(true);
    
    try {
      let response;
      const text = selectedText || '';
      
      switch (type) {
        case 'grammar':
          response = await transformersAI.fixGrammar(text);
          break;
        case 'expand':
          response = await transformersAI.expandText(text);
          break;
        case 'shorten':
          response = await transformersAI.shortenText(text);
          break;
        case 'assist':
          response = await transformersAI.improveWriting(text, instruction || customPrompt);
          break;
        default:
          throw new Error('Unknown action type');
      }
      
      onApply(response.text);
    } catch (error) {
      console.error('AI assistant error:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'Fix Grammar', type: 'grammar', icon: CheckCircle },
    { label: 'Expand', type: 'expand', icon: Maximize2 },
    { label: 'Shorten', type: 'shorten', icon: Minimize2 },
    { label: 'Improve Writing', type: 'assist', instruction: 'Improve the writing style and clarity', icon: Type },
  ];

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={loading}
            className="h-7 px-2 text-xs gap-1.5"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Wand2 className="w-3.5 h-3.5" />
            )}
            AI Assist
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {quickActions.map((action) => (
            <DropdownMenuItem
              key={action.type}
              onClick={() => handleAIAction(action.type, action.instruction)}
              disabled={loading}
            >
              <action.icon className="w-4 h-4 mr-2" />
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center gap-1">
        <Input
          placeholder="Custom instruction..."
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          className="h-7 text-xs w-40"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && customPrompt) {
              handleAIAction('assist', customPrompt);
            }
          }}
        />
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={() => handleAIAction('assist', customPrompt)}
          disabled={!customPrompt || loading}
        >
          <Wand2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default AIWritingAssistant;
