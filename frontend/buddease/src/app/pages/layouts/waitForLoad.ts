// Generalized waitForLoad function
export function waitForLoad<T>(
  checkCondition: () => boolean | T, 
  timeout = 10000, 
  interval = 100
): Promise<T> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      try {
        const result = checkCondition();


        if (result !== false) {
          resolve(result as T);
          return;
        }
      } catch (error) {
        reject(error);
      }
      if (Date.now() - startTime > timeout) {
        reject(new Error('Timed out waiting for condition to be met'));
      }
    };

    const intervalId = setInterval(() => {
      check();
      if (Date.now() - startTime > timeout) {
        clearInterval(intervalId);
      }
    }, interval);

    // Check immediately to avoid waiting for the first interval
    check();
  });
}

// Usage 1: Wait for page load
waitForLoad(() => document.readyState === 'complete', 10000, 100)
  .then(() => console.log('Page fully loaded'))
  .catch((error) => console.error(error));

// Usage 2: Wait for a specific element to exist
waitForLoad(() => document.querySelector('#my-element'), 10000, 100)
  .then((element) => console.log('Element loaded:', element))
  .catch((error) => console.error(error));

// Usage 3: Wait for API response
const fetchData = async () => fetch('https://jsonplaceholder.typicode.com/todos/1').then(res => res.json());

waitForLoad(async () => {
  const data = await fetchData();
  return data && data.id === 1 ? data : false;
}, 10000, 100)
  .then((data) => console.log('Data loaded:', data))
  .catch((error) => console.error(error));
