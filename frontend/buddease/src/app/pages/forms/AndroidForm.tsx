// AndroidForm.tsx
import React, { useState } from "react";

interface AndroidFormState {
  buildGradleDependencies: string;
  gradlePropertiesConfig: string;
  settingsGradleConfig: string;
  localPropertiesAndroidSDK: string;
  androidManifestComponents: string;
  androidAppResources: string;
  dependencies: string;
  gradleProperties: string;
  settingsGradle: string;
  manifest: string;
  resources: string;
}

const AndroidForm: React.FC = () => {
  const [formData, setFormData] = useState<AndroidFormState>({
    buildGradleDependencies: "",
    gradlePropertiesConfig: "",
    settingsGradleConfig: "",
    localPropertiesAndroidSDK: "",
    androidManifestComponents: "",
    androidAppResources: "",
    dependencies: "",
    gradleProperties: "",
    settingsGradle: "",
    manifest: "",
    resources: "",
  });



  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };


  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle form submission logic
    console.log("Form data submitted:", formData);
  };

  return (
    <div>
      <h2>Android Configuration Form</h2>
      <form id="androidConfigForm" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="buildGradleDependencies">
            build.gradle (App level):
          </label>
          <input
            type="text"
            id="buildGradleDependencies"
            name="buildGradleDependencies"
            value={formData.buildGradleDependencies}
            onChange={handleInputChange}
          />
        </div>
        {/* Repeat similar input fields for other Android-specific files and configurations */}
        <div>
          <button type="submit">Submit</button>
        </div>
          <div className="form-group">
            <label htmlFor="dependencies">Dependencies:</label>
            <textarea
              id="dependencies"
              name="dependencies"
              rows={4}
              cols={50}
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="gradleProperties">Gradle Properties:</label>
            <textarea
              id="gradleProperties"
              name="gradleProperties"
              rows={4}
              cols={50}
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="settingsGradle">Settings.gradle:</label>
            <textarea
              id="settingsGradle"
              name="settingsGradle"
              rows={4}
              cols={50}
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="localProperties">Local.properties:</label>
            <input
              type="text"
              id="localProperties"
              name="localProperties"
              size={50}
            ></input>
          </div>
          <div className="form-group">
            <label htmlFor="manifest">AndroidManifest.xml:</label>
            <textarea
              id="manifest"
              name="manifest"
              rows={4}
              cols={50}
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="resources">res Directory:</label>
            <textarea
              id="resources"
              name="resources"
              rows={4}
              cols={50}
            ></textarea>
          </div>
          <button type="submit">Submit</button>
        </form>
    </div>
  );
};

export default AndroidForm;
