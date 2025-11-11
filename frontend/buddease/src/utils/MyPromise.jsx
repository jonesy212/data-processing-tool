export default class MyPromise {
    constructor(executor) {
      this._status = 'pending';
      this._value = undefined;
      this._error = undefined;
      this._onFulfilledCallbacks = [];
      this._onRejectedCallbacks = [];
  
      const resolve = (value) => {
        if (this._status === 'pending') {
          this._status = 'fulfilled';
          this._value = value;
          this._onFulfilledCallbacks.forEach((callback) => callback(value));
        }
      };
  
      const reject = (reason) => {
        if (this._status === 'pending') {
          this._status = 'rejected';
          this._error = reason;
          this._onRejectedCallbacks.forEach((callback) => callback(reason));
        }
      };
  
      try {
        executor(resolve, reject);
      } catch (error) {
        reject(error);
      }
    }
  
    then(onfulfilled) {
      return new MyPromise((resolve, reject) => {
        const handleFulfillment = (value) => {
          try {
            const result = onfulfilled ? onfulfilled(value) : value;
            resolve(result);
          } catch (error) {
            reject(error);
          }
        };
  
        if (this._status === 'fulfilled') {
          handleFulfillment(this._value);
        } else if (this._status === 'pending') {
          this._onFulfilledCallbacks.push(handleFulfillment);
        }
      });
    }
  
    catch(onrejected) {
      return new MyPromise((resolve, reject) => {
        const handleRejection = (reason) => {
          try {
            const result = onrejected ? onrejected(reason) : reason;
            resolve(result);
          } catch (error) {
            reject(error);
          }
        };
  
        if (this._status === 'rejected') {
          handleRejection(this._error);
        } else if (this._status === 'pending') {
          this._onRejectedCallbacks.push(handleRejection);
        }
      });
    }
  
    finally(onfinally) {
      return new MyPromise((resolve) => {
        const handleFinally = () => {
          try {
            const result = onfinally ? onfinally() : undefined;
            resolve(result);
          } catch (error) {
            reject(error);
          }
        };
  
        if (this._status !== 'pending') {
          handleFinally();
        } else {
          this._onFinallyCallbacks.push(handleFinally);
        }
      });
    }
  
    static resolve(value) {
      return new MyPromise((resolve) => resolve(value));
    }
  
    static reject(reason) {
      return new MyPromise((_, reject) => reject(reason));
    }
  }
  
  // Example usage
  const promise = new MyPromise((resolve, reject) => {
    // Your asynchronous logic here
    setTimeout(() => {
      resolve('Promise resolved!');
    }, 1000);
  });
  
  promise
    .then((result) => {
      console.log(result);
      return 'New value after resolution';
    })
    .catch((error) => {
      console.error(error);
      return 'Fallback value on rejection';
    })
    .finally(() => {
      console.log('Finally block executed');
    });
  

