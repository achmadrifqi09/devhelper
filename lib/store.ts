import { create } from "zustand";

interface StoreState {
    isSuccess: boolean;
    result: object;
    setSuccess: (value: boolean) => void;
    setResult: (json: object) => void;
}

export const useConverted = create<StoreState>((set) => ({
    isSuccess: false,
    result: {},

    setSuccess: (value: boolean) => set({ isSuccess: value }),
    setResult: (json: object) => set({ result: json }),
}));
