CorrectionList.tsx
import { Correction } from '@/core/generators/corrections/CorrectionGenerator';
import React, { useEffect, useState } from 'react';


export const CorrectionList: React.FC = () => {
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading corrections
    const loadCorrections = async () => {
      try {
        // In a real app, you would fetch from your CorrectionGenerator
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock data - replace with actual data from your analysis
        const mockCorrections: Correction[] = [
          {
            id: '1',
            title: 'Missing React Native Dependencies',
            description: 'Essential React Native packages are missing from your project.',
            severity: 'warning',
            category: 'dependencies'
          },
          {
            id: '2', 
            title: 'Performance Anti-pattern Detected',
            description: 'Large component files found that could impact performance.',
            severity: 'suggestion',
            category: 'performance'
          },
          {
            id: '3',
            title: 'Security Vulnerability',
            description: 'Outdated packages with known security issues detected.',
            severity: 'error',
            category: 'security'
          },
          {
            id: '4',
            title: 'TypeScript Configuration Issues',
            description: 'Missing strict mode and type checking configurations.',
            severity: 'warning',
            category: 'typescript'
          }
        ];
        
        setCorrections(mockCorrections);
      } catch (error) {
        console.error('Failed to load corrections:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCorrections();
  }, []);

  const categories = ['all', 'dependencies', 'performance', 'security', 'typescript'];
  const filteredCorrections = selectedCategory === 'all' 
    ? corrections 
    : corrections.filter(c => c.category === selectedCategory);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'red';
      case 'warning': return 'orange';
      case 'suggestion': return 'blue';
      default: return 'gray';
    }
  };

  if (isLoading) {
    return (
      <div className="correction-list loading">
        <div className="loading-spinner"></div>
        <p>Loading correction suggestions...</p>
      </div>
    );
  }

  return (
    <div className="correction-list">
      <div className="correction-header">
        <h3>📋 Suggested Corrections</h3>
        <p>Found {corrections.length} issues in your codebase</p>
      </div>

      <div className="category-filters">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      <div className="corrections-grid">
        {filteredCorrections.map(correction => (
          <div key={correction.id} className={`correction-card ${correction.severity}`}>
            <div className="correction-header">
              <span className={`severity-dot ${getSeverityColor(correction.severity)}`}></span>
              <h4>{correction.title}</h4>
            </div>
            <p className="correction-message">{correction.message}</p>
            <div className="correction-meta">
              <span className="category-tag">{correction.category}</span>
              <span className="severity-badge">{correction.severity}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredCorrections.length === 0 && (
        <div className="no-corrections">
          <p>No corrections found in the selected category.</p>
        </div>
      )}
    </div>
  );
};