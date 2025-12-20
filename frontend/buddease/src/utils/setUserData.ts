import useSettingManagerStore from "@/app/state/stores/SettingsStore";
import { useDispatch } from "react-redux";
import { UserManagerState } from "@/app/state/redux/slices/UserSlice";

// Redux implementation
const setUserDataRedux = (userData: UserManagerState) => {
  const dispatch = useDispatch();
  dispatch(setUser(userData));
};

// MobX implementation
const setUserDataMobX = (userData: UserManagerState) => {
  const settingsStore = useSettingManagerStore();
  settingsStore.setUserData(userData);
};
