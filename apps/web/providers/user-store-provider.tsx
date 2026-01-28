'use client'

import { type ReactNode, createContext, useRef, useContext } from 'react'
import { useStore } from 'zustand'

import { type UserStore, createUserStore, type UserState } from '@/stores/user-store'

export type UserStoreApi = ReturnType<typeof createUserStore>

export const UserStoreContext = createContext<UserStoreApi | undefined>(
    undefined,
)

export interface UserStoreProviderProps {
    children: ReactNode
    user: UserState
}

export const UserStoreProvider = ({
    children,
    user,
}: UserStoreProviderProps) => {
    const storeRef = useRef<UserStoreApi>(null)
    if (!storeRef.current) {
        storeRef.current = createUserStore(user)
    }

    return (
        <UserStoreContext.Provider value={storeRef.current}>
            {children}
        </UserStoreContext.Provider>
    )
}

export const useUserStore = <T,>(
    selector: (store: UserStore) => T,
): T => {
    const userStoreContext = useContext(UserStoreContext)

    if (!userStoreContext) {
        throw new Error(`useUserStore must be used within UserStoreProvider`)
    }

    return useStore(userStoreContext, selector)
}
