import React, { useState } from 'react';
import { Sparkles, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { transformersAI } from '@/services/transformersAI';

interface AISummarizerProps {
  content: string;
}

type SummaryLength = 'short' | 'medium' | 'detailed';

const AISummarizer: React.FC<AISummarizerProps> = ({ content }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaryLength, setSummaryLength] = useState<SummaryLength>('medium');
  const [summary, setSummary] = useState<string | null>(null);

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  const handleSummarize = async () => {
    const textContent = stripHtml(content);
    
    if (textContent.length < 50) {
      setSummary("Note is too short to summarize. Please add more content.");
      return;
    }

    setIsGenerating(true);
    setSummary(null);
    
    try {
      const response = await transformersAI.summarizeText(textContent, summaryLength);
      setSummary(response.text);
    } catch (error) {
      console.error('Summarization error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-card">
      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg gradient-primary flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-medium text-sm text-card-foreground">AI Summarizer</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Expanded content */}
      <div className={cn(
        "overflow-hidden transition-all duration-300",
        isExpanded ? "max-h-96" : "max-h-0"
      )}>
        <div className="p-4 pt-0 space-y-4">
          {/* Controls */}
          <div className="flex items-center gap-3">
            <Select
              value={summaryLength}
              onValueChange={(value: SummaryLength) => setSummaryLength(value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Summary length" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={handleSummarize}
              disabled={isGenerating}
              className="gradient-primary text-primary-foreground"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Summarize Note
                </>
              )}
            </Button>
          </div>

          {/* Summary output */}
          {summary && (
            <div className="p-4 rounded-lg bg-accent/50 border border-accent animate-fade-in">
              <h4 className="text-sm font-medium text-accent-foreground mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Summary ({summaryLength}) - Enhanced AI
              </h4>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {summary}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AISummarizer;
