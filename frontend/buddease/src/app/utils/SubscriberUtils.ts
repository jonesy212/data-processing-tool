// SubscriberUtils.ts
// Example converter function to map SubscriberCallback<T, K>[] to SubscriberCollection<T, K>[]
function convertToSubscriberCollection<T, K>(callbacks: SubscriberCallback<T, K>[]): SubscriberCollection<T, K>[] {
    // Implement your conversion logic here
    // Assuming you need to wrap each SubscriberCallback into a structure matching SubscriberCollection
    return callbacks.map(callback => {
      // Placeholder transformation logic - adapt as needed based on actual types
      const collection: SubscriberCollection<T, K> = {}; // Create an empty collection
      // Here you would define how callback should be transformed into a SubscriberCollection item
      // For example, if `callback` has metadata or an ID you can use as a key:
      const key = "someUniqueKey"; // Replace with actual logic to generate a key based on callback
      collection[key] = [callback as unknown as Subscriber<T, K>]; // Type casting example
      return collection;
    });
  }

  export { convertToSubscriberCollection }