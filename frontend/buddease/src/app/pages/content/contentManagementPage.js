// contentManagementPage.js


// Define the content management page generator function
const contentManagementPage = (Component) => {
  // Return a functional component that wraps the provided component with content management features
  return () => {
    
    return (
      <RootLayout>
      <div>
        {/* You can add any additional content management features here */}
        <Component />
      </div>
      </RootLayout>

    );
  };
};

export default contentManagementPage;
