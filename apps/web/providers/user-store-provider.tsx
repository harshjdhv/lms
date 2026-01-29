"use client";

import {
  type ReactNode,
  createContext,
  useRef,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

import {
  type UserStore,
  createUserStore,
  type UserState,
} from "@/stores/user-store";

export type UserStoreApi = ReturnType<typeof createUserStore>;

export const UserStoreContext = createContext<UserStoreApi | undefined>(
  undefined,
);

export interface UserStoreProviderProps {
  children: ReactNode;
  user: UserState;
}

export const UserStoreProvider = ({
  children,
  user,
}: UserStoreProviderProps) => {
  const storeRef = useRef<UserStoreApi>(null);

  if (!storeRef.current) {
    storeRef.current = createUserStore(user);
  }

  // Memoize the store to prevent recreating it
  const store = useMemo(() => storeRef.current!, []);

  return (
    <UserStoreContext.Provider value={store}>
      {children}
    </UserStoreContext.Provider>
  );
};

export const useUserStore = <T,>(selector: (store: UserStore) => T): T => {
  const userStoreContext = useContext(UserStoreContext);

  if (!userStoreContext) {
    throw new Error(`useUserStore must be used within UserStoreProvider`);
  }

  // Use useSyncExternalStore directly to avoid React 19 getServerSnapshot issues
  // This properly caches the snapshot and avoids infinite loops
  return useSyncExternalStore(
    userStoreContext.subscribe,
    () => selector(userStoreContext.getState()),
    () => selector(userStoreContext.getState()), // Server snapshot (same as client for now)
  );
};
