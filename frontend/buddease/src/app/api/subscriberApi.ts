// subscriberApi.ts
 import { Data } from "../components/models/data/Data";
import { K, T } from "../components/snapshots/SnapshotConfig";
import { Subscriber } from "../components/users/Subscriber";
import axiosInstance from "./axiosInstance";

export const getSubscriberId = (subscriber: Subscriber<T,K>) => subscriber.id
export const getSubscribersAPI = async <T extends Data, K extends Data>(): Promise<Subscriber<T, K>[]> => {
  try {
    const response = await axiosInstance.get("/subscribers");
    return response.data;
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    throw error;
  }
};



export const getSubscriberById = async (subscriberId: string): Promise<Subscriber<T,K>> => {
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

