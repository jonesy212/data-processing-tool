import axiosInstance from "../security/csrfToken";

interface CommissionRecord {
    commissionAmount: number;
    userId: string;
  }
  
  async function recordCommission(commissionRecord: CommissionRecord): Promise<void> {
    try {
      // Make an HTTP POST request to the server to record the commission
      const response = await axiosInstance.post('/api/record-commission', commissionRecord);
  
      // Check if the request was successful
      if (response.status === 200) {
        console.log('Commission recorded successfully:', commissionRecord.commissionAmount);
      } else {
        console.error('Failed to record commission:', response.statusText);
      }
    } catch (error: any) {
      // Handle errors
      console.error('Error recording commission:', error.message);
    }
  }