// LoginFormStore.ts
import { makeAutoObservable } from "mobx";

class LoginFormStore {
  username = "";
  password = "";

  constructor() {
    makeAutoObservable(this);
  }

  setUsername(username: string) {
    this.username = username;
  }

  setPassword(password: string) {
    this.password = password;
  }
}

export const loginFormStore = new LoginFormStore();
