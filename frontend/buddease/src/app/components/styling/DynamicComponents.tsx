//DynamicComponents.tsx
import React from 'react';

interface ButtonProps {
  label: string;
}

interface CardProps {
  title: string;
  content: string;
}

const DynamicComponents: React.FC = () => {
  // Dynamic examples of reusable components
  const buttonExamples: ButtonProps[] = [
    { label: 'Click me' },
    { label: 'Submit' },
    // Add more button examples as needed
  ];

  const cardExamples: CardProps[] = [
    { title: 'Card 1 Title', content: 'Card 1 Content' },
    { title: 'Card 2 Title', content: 'Card 2 Content' },
    // Add more card examples as needed
  ];

  return (
    <div>
      <h1>Dynamic Components</h1>
      {/* Dynamic rendering of Button components */}
      <div>
        <h2>Buttons</h2>
        {buttonExamples.map((button, index) => (
          <Button key={index} {...button} />
        ))}
      </div>

      {/* Dynamic rendering of Card components */}
      <div>
        <h2>Cards</h2>
        {cardExamples.map((card, index) => (
          <Card key={index} {...card} />
        ))}
      </div>
    </div>
  );
};

// Dynamic Button component
const Button: React.FC<ButtonProps> = ({ label }) => {
  return <button>{label}</button>;
};

// Dynamic Card component
const Card: React.FC<CardProps> = ({ title, content }) => {
  return (
    <div>
      <h3>{title}</h3>
      <p>{content}</p>
    </div>
  );
};

export default DynamicComponents;
