
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TerminalViewProps {
  logs: string[];
}

export const TerminalView: React.FC<TerminalViewProps> = ({ logs }) => {
  return (
    <ScrollArea className="h-full bg-black text-white font-mono p-3 text-sm">
      {logs.length > 0 ? (
        logs.map((log, index) => (
          <div key={index} className="mb-1 break-all">
            {log}
          </div>
        ))
      ) : (
        <p className="text-muted-foreground/70">Terminal output will appear here</p>
      )}
    </ScrollArea>
  );
};
