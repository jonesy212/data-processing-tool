// MultimediaContentCustomization.tsx
import React, { useState } from "react";
import { Button } from "antd";
import ContentCreationPage from "./ContentCreationPage";
import ColorPalette, {
  ColorSwatchProps,
} from "@/app/components/styling/ColorPalette";
import NavigationGenerator, {
  NavigationItem,
} from "@/app/components/hooks/userInterface/NavigationGenerator";
import AdapterContent from "@/app/components/web3/dAppAdapter/AdapterContent";
import ContentRenderer from "@/app/components/libraries/ui/ContentRenderer";
import ContentDetailsListItem from "@/app/components/models/content/ContentDetailsListItem";
import { Project } from "@/app/components/projects/Project";
import { Task } from "@/app/components/models/tasks/Task";
import { Todo } from "@/app/components/todos/Todo";
import { AnimatedComponentProps } from "@/app/components/styling/AnimationsAndTansitions";
import { useNavigate, useNavigation } from "react-router-dom";
import { isProject, isTask, isTodo } from "@/app/components/libraries/ui/ContentHelpers";
import { ChildComponentProps } from "../../hooks/ChildComponent";
import useDeviceDimensions, { DeviceDimensions } from "./DeviceDimensions";
import { brandingSettings } from "@/app/libraries/theme/BrandingService";
import ReusableButton from "../../libraries/ui/buttons/ReusableButton";

interface MultimediaContentCustomizationProps extends ChildComponentProps{
  // Add any necessary props here
  handleAnimationSettingsChange: (settings: AnimatedComponentProps[]) => void;
}

const MultimediaContentCustomization: React.FC<
  MultimediaContentCustomizationProps
> = (props ) => {
    // State for managing branding swatches
    const history = useNavigate()
    const router = useRouter() as ExtendedRouter;
    const dispatch = useDispatch();
    const deviceDimensions: DeviceDimensions = useDeviceDimensions();

  const [brandingSwatches, setBrandingSwatches] = useState<ColorSwatchProps[]>(
    []
  );


  const handleFetchData = async () => {
    try {
      const dataFrameInfo = await getDataFrameInfo();
      console.log("DataFrame Info:", dataFrameInfo);
    } catch (error) {
      console.error("Error fetching DataFrame info:", error);
    }
  };

  // Function to handle branding swatch change
  const handleBrandingSwatchesChange = (swatches: ColorSwatchProps[]) => {
    setBrandingSwatches(swatches);
    // Additional logic if needed
  };

  const handleAnimationSettingsChange = (
    settings: AnimatedComponentProps[]
  ) => {
    // Handle change in animation settings
    props.handleAnimationSettingsChange(settings);
  };

  // State for managing dynamic content
  const [dynamicContent, setDynamicContent] = useState<string>("");

  // Function to handle dynamic content change
  const handleDynamicContentChange = (content: string) => {
    setDynamicContent(content);
    // Additional logic if needed
  };

  // Placeholder array for new color swatches
  const newSwatches: ColorSwatchProps[] = [
    {
      key: 0,
      color: "#ff0000",
      style: { backgroundColor: "#ff0000", width: "50px", height: "50px" },
    },
    {
      key: 1,
      color: "#00ff00",
      style: { backgroundColor: "#00ff00", width: "50px", height: "50px" },
    },
    // Add more swatches as needed
  ];

  return (
    <div
      style={{
        width: deviceDimensions.width < 768
          ? "100%"
          : deviceDimensions.width < 1024
          ? "80%"
          : "60%",
        margin: "auto",
      }}
    >
      <h1>Multimedia Content Customization</h1>

      <p>
        Device Dimensions: {deviceDimensions.width} x {deviceDimensions.height}
      </p>

      
      {/* Color Palette for Branding */}
      <div>
        <h2>Brand Color Palette:</h2>
        <ColorPalette
          swatches={brandingSwatches}
          colorCodingEnabled={true}
          brandingSwatches={brandingSwatches}
        />
        {/* Update Branding Button */}
        <Button onClick={() => handleBrandingSwatchesChange(newSwatches)}>
          Update Branding
        </Button>
      </div>

      {/* Navigation Generator */}
      <div>
        <h2>Navigation Generator:</h2>
        <NavigationGenerator
          onNavigationChange={(newItems: NavigationItem[]) => {
            // Handle navigation changes if needed
            console.log("Navigation items changed:", newItems);
          }}
          defaultNavigationItems={[
            { label: "Example Page", path: "/example", icon: <ExampleIcon /> },
            // Add more default items as needed
          ]}
        />
      </div>

      {/* Adapter Content */}
      <div>
        <h2>Adapter Content:</h2>
        <AdapterContent
          selectedDevice="Mobile"
          animationSettings={[]}
          handleAnimationSettingsChange={handleAnimationSettingsChange}
          handleBrandingSwatchesChange={handleBrandingSwatchesChange}
          headerElements={[]}
          footerElements={[]}
          panelElements={[]}
          buttonElements={[]}
          layoutElements={[]}
          linkElements={[]}
          cardElements={[]}
        />
      </div>

      {/* Content Renderer */}
      <div>
        <h2>Content Renderer:</h2>
        <ContentRenderer
          dynamicContent={[]}
          handleTaskClick={ async (task: Task) => {
            if (isTask(task)) {
                // Handle task click logic
                // For example, you can navigate to the task details page
                history(`/tasks/${task.id}`);
              }
          }}
        
          handleProjectClick={ async (project: Project) => {
            if (isProject(project)) {
                // Handle project click logic
                history(`/projects/${project.id}`)
            }
          }}
          handleTodoClick={async (todoId: string, todo: Todo) => {
            if(isTodo(todo)){
            // Handle todo click logic
                history(`/todos/${todo.id}`)
            }
          }}
        />
      </div>

      {/* Content Creation Page */}
      <div>
        <h2>Content Creation Page:</h2>
        <ContentCreationPage onComplete={() => {}} />
      </div>

      {/* Content Details List Item */}
      <div>
        <h2>Content Details List Item:</h2>
        <ContentDetailsListItem
          item={{
            id: "1",
            title: "Sample Title",
            description: "Sample Description",
            status: "Completed",
            participants: [],
            startDate: new Date("2024-04-20"),
            endDate: new Date("2024-04-30"),
          }}
        />
      </div>
      <ReusableButton
        router={router}
        brandingSettings={brandingSettings}
        onClick={handleFetchData} // Replace with ReusableButton
        label="Fetch DataFrame Info"
        variant="primary" // Optional: can be customized
      />

      {/* Adjust layout based on device type */}
      {deviceDimensions.width < 768 && <p>Rendering Mobile Layout</p>}
      {deviceDimensions.width >= 768 && deviceDimensions.width < 1024 && (
        <p>Rendering Tablet Layout</p>
      )}
      {deviceDimensions.width >= 1024 && <p>Rendering Desktop Layout</p>}
    </div>
  );
};

// Todo: Replace with your actual icon
const ExampleIcon: React.FC = () => <span>🌐</span>;

export default MultimediaContentCustomization;
export type {MultimediaContentCustomizationProps}