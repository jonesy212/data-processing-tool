import { useNotification } from '@/app/components/support/NotificationContext';
import { endpoints } from "../api/ApiEndpoints";
import axiosInstance from "../api/axiosInstance";
import { NotificationTypeEnum } from "../components/support/NotificationContext";
import NOTIFICATION_MESSAGES from "../components/support/NotificationMessages";

const API_BASE_URL = endpoints.generators.generateTransferToken
const { notify } = useNotification();

export const generateTransferToken = async () => {
    try {
        const response = await axiosInstance.post(API_BASE_URL);
        const { transferToken } = response.data;
        notify(
            'success',
            NOTIFICATION_MESSAGES.TokenUtils.SUCCESS_GENERATING_TRANSFER_TOKEN,
            {},
            new Date,
            NotificationTypeEnum.OperationSuccess);
        return transferToken;
    } catch (error) {
        notify(
            'error',
            NOTIFICATION_MESSAGES.TokenUtils.ERROR_GENERATING_TRANSFER_TOKEN,
            {},
            new Date,
            NotificationTypeEnum.Error);
        console.error('Error generating transfer token:', error);
        return null;
    }
};


export const handleAdminLogin = async () => {
    try {
        const transferToken = await generateTransferToken();
        if (!transferToken) {
            console.error('Failed to obtain transfer token');
            notify(
                "Transfer token was not abe to be received.",
                NOTIFICATION_MESSAGES.TokenUtils.ERROR_GENERATING_TRANSFER_TOKEN,
                {},
                new Date,
                NotificationTypeEnum.Error);
            return;
        }
        const response = await axiosInstance.post(endpoints.auth.admin, { token: transferToken });
        const accessToken = response.data.access_token;
        localStorage.setItem("adminToken", accessToken);
        // Handle response as needed
    } catch (error) {
        console.error('Error during admin login:', error);
        notify(
            "error",
            NOTIFICATION_MESSAGES.TokenUtils.ERROR_GENERATING_TRANSFER_TOKEN,
            {},
            new Date,
            NotificationTypeEnum.Error);
    }
};
