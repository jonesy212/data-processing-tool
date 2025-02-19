// subscriberApi.ts 
import { BaseData } from '@/app/components/models/data/Data';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { Subscriber } from "../components/users/Subscriber";
import axiosInstance from "./axiosInstance";

export const getSubscriberId = <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(subscriber: Subscriber<T, K>) => subscriber.id
export const getSubscribersAPI = async <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(): Promise<Subscriber<T, K>[]> => {
  try {
    const response = await axiosInstance.get("/subscribers");
    return response.data;
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    throw error;
  }
};



export const getSubscriberById = async <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(subscriberId: string): Promise<Subscriber<T, K>> => {
  try {
    const response = await axiosInstance.get("/subscribers/" + subscriberId);
    return response.data;
  } catch (error) {
    console.error("Error fetching subscriber by id:", error);
    throw error;
  }
};

const fetchSubscribers = async () => {
  try {
    const subscribers = await getSubscribersAPI();
    console.log("Subscribers:", subscribers);
  } catch (error) {
    console.error("Failed to fetch subscribers:", error);
  }
};



fetchSubscribers();

