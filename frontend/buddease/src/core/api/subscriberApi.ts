subscriberApi.ts 
import axiosInstance from "@/core/api/csrfToken";
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { Subscriber } from "@/core/subscribers/Subscriber";

Server-side API with ALL 6 generic parameters
export const getSubscriberId = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  subscriber: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): string | undefined => subscriber.id;

export const getSubscribersAPI = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(): Promise<Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {
  try {
    const response = await axiosInstance.get("/subscribers");
    return response.data;
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    throw error;
  }
};

export const getSubscriberByIdAPI = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(subscriberId: string): Promise<Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
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

