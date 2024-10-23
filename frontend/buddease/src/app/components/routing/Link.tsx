import React from 'react';

interface LinkProps {
  id: string;
}

const Link: React.FC<LinkProps> = ({ id }) => {
  // Replace with your actual link implementation
  return <a href={`/link/${id}`}>Link {id}</a>;
};

export default Link;