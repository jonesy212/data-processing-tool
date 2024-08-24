// FeedbackService.tsx
import { YourProductContentType } from '../products/YourProductContentType';
import dataProcessingService, { DataProcessing, DataProcessingResult } from '../projects/DataAnalysisPhase/DataProcessing/DataProcessingService';
import { Feedback } from './Feedback';
import { Channel, ChannelType } from "@/app/components/interfaces/chat/Channel";

class FeedbackService {
  private static instance: FeedbackService;
  private initialized: boolean;

  private constructor() {
    // Enforce singleton pattern
    if (FeedbackService.instance) {
      throw new Error('FeedbackService is a singleton. Use getInstance() method.');
    }

    // Add any initialization logic if needed
    this.initialized = false;
  }

  public static getInstance(): FeedbackService {
    if (!this.instance) {
      this.instance = new FeedbackService();
    }
    return this.instance;
  }

  private initialize(): void {
    // Add initialization logic if needed
    this.initialized = true;
  }


  // Function to gather feedback from team members
  public async gatherFeedback(
    feedbackData: Feedback[],
    channel: Channel,
  ): Promise<void> {
    try {
      if (!this.initialized) {
        this.initialize();
      }

      if (!feedbackData || feedbackData.length === 0) {
        throw new Error('Invalid feedback data provided.');
      }

      // Simulate sending feedback data to the server for processing
      let dataProcessingPayload: DataProcessing = {
        datasetPath: '/feedback-data',
        // Add more properties if needed
      };

      // Switch based on the channel to customize the dataset path
      switch (channel.type) {
        case 'audio':
          dataProcessingPayload.datasetPath = '/audio-feedback-data';
          break;
        case 'video':
          dataProcessingPayload.datasetPath = '/video-feedback-data';
          break;
        case 'text':
          dataProcessingPayload.datasetPath = '/channel-feedback-data';
          break;
        default:
          throw new Error(`Invalid feedback channel: ${channel.type}`);
      }

      // Send feedback data for processing
      const result: DataProcessingResult = await dataProcessingService.loadDataAndProcess(dataProcessingPayload);

      // Process the result if necessary (e.g., update UI, trigger notifications)
      console.log('Feedback processing result:', result);
    } catch (error) {
      console.error('Error processing feedback data:', error);
      throw error; // Rethrow the error to maintain consistency
    }
  }
  

  // Add a new method to handle product content
  public async processProductContent(productContent: YourProductContentType, productChannel: string): Promise<void> {
    try {
      if (!this.initialized) {
        this.initialize();
      }

      if (!productContent || Object.keys(productContent).length === 0) {
        
            }

      // Simulate sending product content to the server for processing
      let dataProcessingPayload: DataProcessing = {
        datasetPath: '/product-content-data',
        // Add more properties if needed
      };

      // Customize payload based on product content type
      // Example: if (productContent.type === 'audio') { ... }

      // Send product content for processing
      const result: DataProcessingResult = await dataProcessingService.loadDataAndProcess(dataProcessingPayload);

      // Process the result if necessary
      console.log('Product content processing result:', result);
    } catch (error) {
      console.error('Error processing product content:', error);
      throw error;
    }
  }
}

// Example usage in your project management app
try {
  const feedbackService = FeedbackService.getInstance();

  // Assume you have gathered feedback data
  const feedbackData: Feedback[] = [
    {
      userId: 'user-feedbackId-1',
      id: 'user-feedbackId-2',
      comment: 'Great work!',
      rating: 5,
      timestamp: new Date(),
      audioUrl: 'http://www.youtube.com/watch?v',
      videoUrl: 'http://www.youtube.com/watch?v',
      resolved: false,
    },
    // Add more feedback items
  ];

  // Gather and process feedback
  feedbackService.gatherFeedback(feedbackData, {
    type: ChannelType.Audio,
    id: 'channel-feedback-audio-id',
    name: 'feedback-audio-name',
    members: [],
    messages: []
  }); // Specify the channel

  // Example usage for processing product content
  const productContent: YourProductContentType = {} as YourProductContentType
  const productChannel = 'product'; // Specify the product channel
  feedbackService.processProductContent(productContent, productChannel);
} catch (error) {
  console.error('Error creating FeedbackService instance:', error);
}

export default FeedbackService;
