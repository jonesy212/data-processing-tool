// syncEndpointsWithExternalServicesUtils.ts
import { endpoints } from '@/core/api/ApiEndpoints'
import { socialMediaActions } from '@/core/actions/socialMediaActions';
import type { ExternalReference } from '@/core/calendar/ExternalReference';
import { externalApiInstances } from '@/core/api/externalApiConfig'
import { getApiInfo } from '@/core/api/externalApiConfig'
import { externalAPIs } from "@/core/api/externalAPIs";

interface SyncResult {
  success: boolean;
  changes: any;
  externalReferences: ExternalReference[];
}


function isExternalAPIKey(key: string): key is keyof typeof externalAPIs {
  return key in externalAPIs;
}


const syncEndpointsWithExternalServices = async (): Promise<SyncResult> => {
  try {
    // Fetch endpoints from external services using external API instances
    const externalEndpoints = await fetchExternalEndpoints();
    
    // Compare and get differences
    const diff = compareEndpoints(endpoints, externalEndpoints);
    
    // Create external references for tracking
    const externalReferences = createExternalReferences(diff);
    
    // React to changes
    await reactToEndpointChanges(diff, externalReferences);
    
    return {
      success: true,
      changes: diff,
      externalReferences
    };
  } catch (error) {
    console.error('Error syncing endpoints:', error);
    return {
      success: false,
      changes: {},
      externalReferences: []
    };
  }
};

const createExternalReferences = (diff: any): ExternalReference[] => {
  const references: ExternalReference[] = [];
  
  for (const platform in diff) {
    if (diff.hasOwnProperty(platform)) {
      if (isExternalAPIKey(platform)) {
        const apiInfo = getApiInfo(platform);
        
        references.push({
          id: `sync-${platform}-${Date.now()}`,
          source: platform,
          url: apiInfo?.documentation,
          metadata: {
            syncTimestamp: new Date().toISOString(),
            changes: diff[platform],
            apiName: apiInfo?.name
          }
        });
      } else {
        // Handle platforms not in externalAPIs
        console.warn(`Platform "${platform}" not found in externalAPIs`);
        
        references.push({
          id: `sync-${platform}-${Date.now()}`,
          source: platform,
          url: undefined,
          metadata: {
            syncTimestamp: new Date().toISOString(),
            changes: diff[platform],
            apiName: platform,
            isKnownPlatform: false
          }
        });
      }
    }
  }
  
  return references;
};


const fetchExternalEndpoints = async () => {
  try {
    // Use external API instances instead of axiosInstance
    const [facebookEndpoints, twitterEndpoints, youtubeEndpoints] = await Promise.all([
      externalApiInstances.facebook.get('/me').catch(() => null),
      externalApiInstances.twitter.get('/2/tweets/search/stream/rules').catch(() => null),
      externalApiInstances.youtube.get('/channels').catch(() => null),
    ]);

    return {
      facebook: facebookEndpoints?.data || {},
      twitter: twitterEndpoints?.data || {},
      youtube: youtubeEndpoints?.data || {},
      // Add more services as needed
    };
  } catch (error) {
    console.error('Error fetching external endpoints:', error);
    return {};
  }
};


// Function to compare endpoints between the application and external services
const compareEndpoints = (internalEndpoints: any, externalEndpoints: any) => {
  // Compare endpoints for each external service with the corresponding internal endpoints
  const diff: any = {};

  // Compare Facebook endpoints
  if (JSON.stringify(internalEndpoints.details.facebook) !== JSON.stringify(externalEndpoints.facebook)) {
    diff.facebook = {
      internal: internalEndpoints.details.facebook,
      external: externalEndpoints.facebook,
    };
  }

  // Compare Twitter endpoints
  if (JSON.stringify(internalEndpoints.details.twitter) !== JSON.stringify(externalEndpoints.twitter)) {
    diff.twitter = {
      internal: internalEndpoints.details.twitter,
      external: externalEndpoints.twitter,
    };
  }

  // Compare YouTube endpoints
  if (JSON.stringify(internalEndpoints.details.youtube) !== JSON.stringify(externalEndpoints.youtube)) {
    diff.youtube = {
      internal: internalEndpoints.details.youtube,
      external: externalEndpoints.youtube,
    };
  }

  // Compare endpoints from other external services as needed

  return diff;
};

// Function to react to endpoint changes
const reactToEndpointChanges = (diff: any, externalReferences: ExternalReference[]) => {
  // Example: Log the differences between internal and external endpoints
  console.log('Endpoint differences:', diff);
  console.log('External references:', externalReferences);

  // Example: Update internal endpoints based on external endpoints
  updateInternalEndpoints(diff, externalReferences);

  // Example: Notify administrators about endpoint changes
  notifyAdministrators(diff, externalReferences);
};

// Function to update internal endpoints based on differences
const updateInternalEndpoints = (diff: any, externalReferences: ExternalReference[]) => {
  // Loop through the differences object
  for (const platform in diff) {
    if (diff.hasOwnProperty(platform)) {
      const endpoints = diff[platform];
      // Update internal endpoints based on the platform and its corresponding endpoints
      switch (platform) {
        case 'facebook':
          // Dispatch action to update Facebook endpoints
          socialMediaActions.updateFacebookEndpoints({ endpoints });
          break;
        case 'instagram':
          // Dispatch action to update Instagram endpoints
          socialMediaActions.updateInstagramEndpoints({ endpoints });
          break;
        case 'twitter':
          // Dispatch action to update Twitter endpoints
          socialMediaActions.updateTwitterEndpoints({ endpoints });
          break;
        case 'youtube':
          // Dispatch action to update YouTube endpoints
          socialMediaActions.updateYouTubeEndpoints({ endpoints });
          break;
        case 'tiktok':
          // Dispatch action to update TikTok endpoints
          socialMediaActions.updateTikTokEndpoints({ endpoints });
          break;
        default:
          // Handle unsupported platforms or additional logic if needed
          console.warn(`Unsupported platform: ${platform}`);
      }
    }
  }
}


// Function to notify administrators about endpoint changes
const notifyAdministrators = (diff: any, externalReferences: ExternalReference[]) => {
  // Example: Notify administrators about endpoint differences via email, logging, or notifications
  // Implement logic to notify administrators (e.g., send email, log message)

  // Example: Sending an email to administrators
  const sendEmailToAdministrators = (subject: string, body: string) => {
    // Logic to send an email to administrators
    // Example: Using a third-party email service or internal email server
    console.log(`Email sent to administrators: Subject - ${subject}, Body - ${body}`);
  };

  // Construct the email content with endpoint differences
  let emailSubject = "Endpoint Changes Detected";
  let emailBody = "Changes in endpoints:\n";
  
  for (const platform in diff) {
    if (diff.hasOwnProperty(platform)) {
      emailBody += `\nPlatform: ${platform}\n`;
      const endpoints = diff[platform];
      for (const endpoint in endpoints) {
        if (endpoints.hasOwnProperty(endpoint)) {
          emailBody += `${endpoint}: ${endpoints[endpoint]}\n`;
        }
      }
    }
  }
  
  // Add external references information
  emailBody += "\nExternal References Created:\n";
  externalReferences.forEach(ref => {
    emailBody += `- ${ref.source}: ${ref.id} (${ref.url})\n`;
  });

  // Send email to administrators
  sendEmailToAdministrators(emailSubject, emailBody);
};

// Example usage: Call the function to sync endpoints with external services
syncEndpointsWithExternalServices();