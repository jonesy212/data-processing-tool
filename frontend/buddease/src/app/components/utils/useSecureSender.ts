// useSecureSender.ts
import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { sanitizeData } from '../security/SanitizationFunctions';
import { Sender } from '../communications/chat/Communication';
import { User } from '../users/User';
import {
  StudentSender, CryptoSender, ProjectOwnerSender,
  ClientSender,
  FreelancerSender,
  EducatorSender,
  ResearchAnalystSender,
} from '../users/SenderTypes';
import { fetchUserFromDatabase } from '@/app/api/ApiDatabase';

type SenderBase = Pick<
  User,
  | "id"
  | "username"
  | "firstName"
  | "lastName"
  | "email"
  | "tags"
  | "isUserMessage"
  | "tier"
  | "createdAt"
  | "updatedAt"
  | "avatarUrl"
  | "bio"
>;

export const useSecureSender = () => {
  const [sender, setSender] = useState<Sender | null>(null); // Initialize sender as null
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    const fetchSender = async () => {
      if (!isLoading && isAuthenticated && user && user.id) {
        const userId = user.id.toString();

        // Fetch the sender data securely (replace with your actual data fetching logic)
        const fetchedSender = await fetchSenderData(userId); // Assuming you have a function to fetch sender data by user ID

        // Sanitize sender properties
        if (fetchedSender) {
          const sanitizedSender: Sender = {
            ...fetchedSender,
            id: sanitizeData(fetchedSender.id),
            tags: fetchedSender.tags.map((tag: string) => sanitizeData(tag)),
            tier: sanitizeData(fetchedSender.tier),
            createdAt: sanitizeData(fetchedSender.createdAt),
            updatedAt: sanitizeData(fetchedSender.updatedAt),
          };

          setSender(sanitizedSender);
        }
      }
    };

    fetchSender();
  }, [isLoading, isAuthenticated, user]);

  return sender;
};


async function fetchSenderData(userId: string): Promise<Sender | null> {
  const user = await fetchUserFromDatabase(userId); // Replace with actual API call

  if (!user) return null;

  // Sanitize and construct the `Sender` object
  const baseSender: Sender = {
    id: sanitizeData(user.id ? user.id.toString() : ""),
    username: sanitizeData(user.username),
    firstName: sanitizeData(user.firstName),
    lastName: sanitizeData(user.lastName),
    email: sanitizeData(user.email),
    tags: Array.isArray(user.tags) ? user.tags.map((tag) => sanitizeData(tag.toString())) : [],
    isUserMessage: true, // Assuming true for this example
    tier: sanitizeData(user.tier),
    createdAt: sanitizeData(user.createdAt?.toString() ?? ""), // Convert to string safely
    updatedAt: sanitizeData(user.updatedAt?.toString() ?? ""), // Same for `updatedAt`
    avatarUrl: user.avatarUrl ? sanitizeData(user.avatarUrl) : null,
    bio: user.bio ? sanitizeData(user.bio) : null
  };

  // Extend based on user type
  switch (user.userType) {
    case "student":
      return {
        ...baseSender,
        studentDetails: {
          school: user.school ? sanitizeData(user.school) : "Unknown School",
          grade: user.grade ? sanitizeData(user.grade.toString()) : "Unknown Grade",
        },
      } as StudentSender;

    case "crypto":
      return {
        ...baseSender,
        cryptoDetails: {
          walletAddress: user.walletAddress ? sanitizeData(user.walletAddress) : "",
          tokenBalance: user.tokenBalance || 0,
        },
      } as CryptoSender;

    case "projectOwner":
      return {
        ...baseSender,
        ownerDetails: {
          projectsManaged: user.projectsManaged || 0,
          isPremium: user.isPremium || false,
        },
      } as ProjectOwnerSender;

    case "client":
      return {
        ...baseSender,
        clientDetails: {
          companyName: user.companyName ? sanitizeData(user.companyName) : "Unknown Company",
          contractEndDate: sanitizeData(user.contractEndDate?.toString() ?? "Unknown Date"),
        },
      } as ClientSender;

    case "freelancer":
      return {
        ...baseSender,
        freelancerDetails: {
          skills: Array.isArray(user.skills) ? user.skills.map((skill) => sanitizeData(skill)) : [],
          availability: sanitizeData(user.availability || "Unknown"),
        },
      } as FreelancerSender;

    case "educator":
      return {
        ...baseSender,
        educatorDetails: {
          subjects: Array.isArray(user.subjects) ? user.subjects.map((subject) => sanitizeData(subject)) : [],
          institution: sanitizeData(user.institution || "Unknown"),
        },
      } as EducatorSender;

    case "researchAnalyst":
      return {
        ...baseSender,
        researchDetails: {
          focusArea: sanitizeData(user.focusArea || "Unknown"),
          publishedPapers: user.publishedPapers || 0,
        },
      } as ResearchAnalystSender;

    // Default `Sender`
  }
  return baseSender;
}
export type { SenderBase }
