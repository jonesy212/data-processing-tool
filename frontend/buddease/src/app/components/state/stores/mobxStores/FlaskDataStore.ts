import axios from "axios";
import { makeAutoObservable, runInAction } from "mobx";

class FlaskDataStore {
  flaskData = null;

  constructor() {
    makeAutoObservable(this);
    this.fetchData();
  }

  async fetchData() {
    try {
      const response = await axios.get("/api/flaskData"); // Adjust the API endpoint as needed
      const data = response.data;

      runInAction(() => {
        this.flaskData = data;
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
}

export default FlaskDataStore;
