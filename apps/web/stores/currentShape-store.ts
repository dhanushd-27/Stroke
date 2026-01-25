import { create } from "zustand";

export enum Shape {
  Circle = "circle",
  Triangle = "triangle",
  None = "none"
}

type CurrentShapeStore = {
  shape: Shape;
  setShape: (shape: Shape) => void;
}

export const useCurrentShapeStore = create<CurrentShapeStore>((set) => ({
  shape: Shape.None,
  setShape: (shape: Shape) => set({ shape }),
}));