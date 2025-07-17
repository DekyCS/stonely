import React from 'react';

interface RockAnalysisLoaderProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'w-8 h-8',
  md: 'w-11 h-11', // 44px as in original CSS
  lg: 'w-16 h-16'
};

export function RockAnalysisLoader({ 
  text = "Analyzing rock...", 
  size = 'md',
  className = ""
}: RockAnalysisLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className={`${sizes[size]} rock-spinner relative`}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      
      {text && (
        <div className="text-center">
          <p className="text-sm font-medium text-foreground mb-1">{text}</p>
          <p className="text-xs text-muted-foreground">
            This may take a few moments...
          </p>
        </div>
      )}
    </div>
  );
} 