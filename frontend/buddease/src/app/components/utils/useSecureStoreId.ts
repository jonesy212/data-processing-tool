
export const useSecureStoreId = () => {
  const [storeId, setStoreId] = useState<number | null>(null); // Initialize storeId as null or number
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    const fetchStoreId = async () => {
      if (!isLoading && isAuthenticated && user) {
        // Here, you can perform additional checks to ensure that the user is authorized to access the storeId
        // For example, you can check if the storeId belongs to the authenticated user or if the user has admin privileges
        // If the user is not authorized, you can handle it accordingly (e.g., redirecting to a login page, displaying an error message)

        // Extract storeId from the user object or wherever it's stored
        const fetchedStoreId = user.storeId; // Assume `storeId` is a property on the `user` object

        // Sanitize the fetched storeId if necessary (replace with your actual sanitization function)
        const sanitizedStoreId =
          typeof fetchedStoreId === "number" ? sanitizeData(fetchedStoreId) : null;

        setStoreId(sanitizedStoreId);
      }
    };

    fetchStoreId();
  }, [isLoading, isAuthenticated, user]);

  return storeId;
};