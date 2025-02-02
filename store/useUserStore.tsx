import { create } from "zustand";

interface User {
  created_at: string;
  email: string;
  house_name: string;
  id: number;
  jwt_token: string;
  location: string;
  login_status: boolean;
  phone_number: string;
  uid: string;
  user_image: string;
  user_info: string;
  user_name: string;
}

interface ApiResponse {
  message: string;
  status: boolean;
  user: User;
}

interface UserStore {
  userData: ApiResponse | null;
  setUserData: (data: ApiResponse) => void;
  clearUserData: () => void;
}

const useUserStore = create<UserStore>((set) => ({
  userData: null,
  setUserData: (data) => set({ userData: data }),
  clearUserData: () => set({ userData: null }),
}));

export default useUserStore;
