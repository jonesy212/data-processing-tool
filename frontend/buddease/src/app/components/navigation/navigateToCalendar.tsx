import { useNavigate } from "react-router-dom";


// Navigation function to be used when transitioning to the Calendar Page
export const navigateToCalendarPage = () => {
  // Use the react-router-dom hook to navigate to the Calendar Page
  const navigate = useNavigate();
  navigate('/calendar'); // Replace '/calendar' with the actual path of your Calendar Page
};
