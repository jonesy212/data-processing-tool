
import React from 'React';

interface CommonLayoutProps {
  children: React.ReactNode
}


const CommonLayout: React.FC<CommonLayoutProps> = ({ children }) => {
    return (
      <div>
        {/* Common header, footer, or other elements */}
        <header>
          <h1>Your Application</h1>
        </header>
  
        {/* Page content */}
        <main>{children}</main>
  
        {/* Common footer */}
        <footer>Footer content</footer>
      </div>
    );
  };
  

  export default CommonLayout;