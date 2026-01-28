import { createStore } from "zustand/vanilla";

export type UserState = {
  id: string;
  email: string;
  name: string | null;
  role: "STUDENT" | "TEACHER";
  image: string | null;
};

export type UserActions = {
  updateUser: (user: Partial<UserState>) => void;
};

export type UserStore = UserState & UserActions;

export const defaultInitState: UserState = {
  id: "",
  email: "",
  name: "",
  role: "STUDENT",
  image: null,
};

export const createUserStore = (initState: UserState = defaultInitState) => {
  return createStore<UserStore>()((set) => ({
    ...initState,
    updateUser: (user) => set((state) => ({ ...state, ...user })),
  }));
};
