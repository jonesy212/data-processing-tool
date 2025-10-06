import React from 'react';

interface HATEOASLink {
  href: string;
  rel: string;  // Relationship type
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  type?: string; // Media type (e.g., 'application/json')
  title?: string; // Human-readable description
}

interface LinkProps {
  link: HATEOASLink;
  className?: string;
  children?: React.ReactNode;
  onClick?: (link: HATEOASLink) => void;
}

const Link: React.FC<LinkProps> = ({ 
  link, 
  className = '', 
  children, 
  onClick 
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick(link);
    }
  };

  const displayText = children || link.title || link.rel;

  return (
    <a 
      href={link.href}
      className={className}
      onClick={handleClick}
      data-rel={link.rel}
      data-method={link.method}
      title={link.title}
    >
      {displayText}
    </a>
  );
};

// HATEOAS-aware component that renders multiple links
interface HATEOASLinksProps {
  links: HATEOASLink[];
  linkClassName?: string;
  onLinkClick?: (link: HATEOASLink) => void;
}

export const HATEOASLinks: React.FC<HATEOASLinksProps> = ({
  links,
  linkClassName,
  onLinkClick
}) => {
  return (
    <div className="hateoas-links">
      {links.map((link, index) => (
        <Link
          key={`${link.rel}-${index}`}
          link={link}
          className={linkClassName}
          onClick={onLinkClick}
        />
      ))}
    </div>
  );
};

export default Link;