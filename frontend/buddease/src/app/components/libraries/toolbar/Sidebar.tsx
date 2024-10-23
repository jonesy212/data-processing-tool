import React, { ReactNode } from 'react';

interface SidebarProps {
  children?: ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Project Management App</h3>
      </div>
      <ul className="sidebar-menu">
        <li>
          <a href="#home">Home</a>
        </li>
        <li>
          <a href="#project-management">Project Management</a>
          <ul className="submenu">
            <li><a href="#tasks">Tasks</a></li>
            <li><a href="#phases">Phases</a></li>
            <li><a href="#files">Files</a></li>
          </ul>
        </li>
        <li>
          <a href="#collaboration-tools">Collaboration Tools</a>
          <ul className="submenu">
            <li><a href="#chat">Chat</a></li>
            <li><a href="#audio-video-calls">Audio/Video Calls</a></li>
            <li><a href="#community-forum">Community Forum</a></li>
          </ul>
        </li>
        <li>
          <a href="#crypto-section">Crypto Section</a>
          <ul className="submenu">
            <li><a href="#portfolio">Portfolio</a></li>
            <li><a href="#trading">Trading</a></li>
            <li><a href="#news-insights">News & Insights</a></li>
            <li><a href="#community">Community</a></li>
          </ul>
        </li>
      </ul>
      {children} {/* Render children here */}
    </div>
  );
}

export default Sidebar;
