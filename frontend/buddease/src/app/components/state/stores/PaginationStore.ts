import { action, makeObservable, observable } from "mobx";

class PaginationStore {
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  constructor() {
    makeObservable(this, {
      currentPage: observable,
      pageSize: observable,
      totalItems: observable,
      totalPages: observable,
      setCurrentPage: action,
      setPageSize: action,
      setTotalItems: action,
      setTotalPages: action,
      fetchData: action,
    });
  }

  setCurrentPage(page: number) {
    this.currentPage = page;
  }

  setPageSize(size: number) {
    this.pageSize = size;
  }

  setTotalItems(total: number) {
    this.totalItems = total;
  }

  setTotalPages(pages: number) {
    this.totalPages = pages;
  }

  async fetchData() {
    try {
      // Perform asynchronous data fetching here
      // Example:
      // const response = await fetch(`api/data?page=${this.currentPage}&size=${this.pageSize}`);
      // const data = await response.json();
      // Update total items and total pages based on response
      // this.setTotalItems(data.totalItems);
      // this.setTotalPages(Math.ceil(data.totalItems / this.pageSize));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
}

// Create an instance of the PaginationStore
const paginationStore = new PaginationStore();

export default paginationStore;







// import paginationStore from "./PaginationStore";

// // Example usage:
// paginationStore.setCurrentPage(1);
// paginationStore.setPageSize(20);
// await paginationStore.fetchData();
// console.log("Total items:", paginationStore.totalItems);
// console.log("Total pages:", paginationStore.totalPages);
