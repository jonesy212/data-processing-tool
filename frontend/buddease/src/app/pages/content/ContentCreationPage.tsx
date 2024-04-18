// ContentCreationPage.tsx

import AddContent from '@/app/components/models/content/AddContent';
import { ButtonGenerator, buttonGeneratorProps } from '@/app/generators/GenerateButtons';
import React from 'react';

interface ContentCreateionPageProps {
  onComplete: () => void;
}


const ContentCreationPage: React.FC<ContentCreateionPageProps> = ({
    onComplete
}) => {

    const handleAddContentComplete = () => {
      onComplete();
    }
  return (
    <div>
      <h1>Content Creation Page</h1>
          <AddContent
              onComplete={handleAddContentComplete}
          />
      <ButtonGenerator {...buttonGeneratorProps} />
    </div>
  );
};

export default ContentCreationPage;
