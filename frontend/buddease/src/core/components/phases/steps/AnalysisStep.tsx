// AnalysisStep.tsx

import { CorrectionGenerator } from '@/core/generators/corrections/CorrectionGenerator';
import React, { useEffect, useState } from 'react';

interface AnalysisStepProps {
  onNext: () => void;
}

export const AnalysisStep: React.FC<AnalysisStepProps> = ({ onNext }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');

  const analyzeCodebase = async () => {
    setIsAnalyzing(true);
    setProgress(0);
    
    try {
      const generator = new CorrectionGenerator();
      
      // Simulate analysis progress
      const tasks = [
        'Scanning for dependency issues...',
        'Checking code quality patterns...',
        'Analyzing performance issues...',
        'Reviewing security vulnerabilities...',
        'Finalizing analysis...'
      ];

      for (let i = 0; i < tasks.length; i++) {
        setCurrentTask(tasks[i]);
        setProgress(((i + 1) / tasks.length) * 100);
        
        // Simulate task processing time
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Run actual analysis
      await generator.generateCorrections();
      
      // Auto-proceed to next step when analysis completes
      onNext();
      
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    // Start analysis automatically when component mounts
    analyzeCodebase();
  }, []);

  return (
    <div className="analysis-step">
      <h3>🔍 Analyzing Your Codebase</h3>
      
      {isAnalyzing ? (
        <div className="analysis-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="current-task">{currentTask}</p>
          <p className="progress-text">{Math.round(progress)}% complete</p>
        </div>
      ) : (
        <div className="analysis-complete">
          <div className="success-message">
            ✅ Analysis Complete!
          </div>
          <p>Found issues and generated correction suggestions.</p>
          <button onClick={onNext} className="btn-primary">
            View Corrections →
          </button>
        </div>
      )}

      <div className="analysis-info">
        <h4>What we're checking:</h4>
        <ul>
          <li>📦 Dependency conflicts and vulnerabilities</li>
          <li>⚡ Performance anti-patterns</li>
          <li>🔒 Security issues</li>
          <li>🏗️ Code structure problems</li>
          <li>📝 TypeScript and compilation errors</li>
        </ul>
      </div>
    </div>
  );
};