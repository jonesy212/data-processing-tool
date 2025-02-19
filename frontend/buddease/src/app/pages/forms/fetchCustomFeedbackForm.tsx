// fetchCustomFeedbackForm.tsx

import axiosInstance from "@/app/api/axiosInstance";

// Function to fetch customized feedback form based on persona
const fetchCustomFeedbackForm = async (persona) => {
    try {
        const response = await axiosInstance.get(`/api/customize_feedback_form/${persona}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching customized feedback form:", error);
        return null;
    }
};

// Example usage:
const persona = "Art Persona";
fetchCustomFeedbackForm(persona)
    .then((customizedForm) => {
        if (customizedForm && typeof customizedForm === "object") {
            console.log(`Customized Feedback Form Questions for ${persona}:`);
            customizedForm.questions.forEach((question, index) => {
                console.log(`${index + 1}. ${question}`);
            });
            console.log("Additional Information:", customizedForm.additional_info);
        } else {
            console.log(customizedForm);
        }
    });
