import Image from 'next/image';
import React, { useEffect, useState } from 'react';
interface ClickableListProps {
  items: { id: number; label: string; imageSrc: string; onClick: () => void }[];
}

const ClickableList: React.FC<ClickableListProps> = ({ items }) => {
  const [loadedItems, setLoadedItems] = useState<
    { id: number; label: string; image: React.ReactNode; onClick: () => void }[]
  >([]);

  useEffect(() => {
    const loadImage = async (item: {
      id: number;
      label: string;
      imageSrc: string;
      onClick: () => void;
    }) => {
      try {
        const response = await fetch(item.imageSrc);
        const blob = await response.blob();
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });

        setLoadedItems((prevItems) => [
          ...prevItems,
          {
            ...item,
            image: <Image src={dataUrl} alt={item.label} />,
            onClick: item.onClick,
          },
        ]);
      } catch (error) {
        console.error(`Error loading image for item ${item.label}:`, error);
      }
    };

    items.forEach((item) => loadImage(item));
  }, [items]);

  return (
    <div>
      {loadedItems.map((item) => (
        <div key={item.id} className="clickable-item" onClick={item.onClick}>
          {item.image}
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default ClickableList;
