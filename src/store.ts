import {createStore} from "zustand/vanilla";

const initial = 0;

export const cronometerStore: any = createStore((set) => ({
  intervaloId: null,
  elapsed: initial,

  start: () => {
    const novoId = setInterval(add, 1000);
    set({ intervaloId: novoId, elapsed: 1 });
  },
  resume: () => {
    const novoId = setInterval(add, 1000);
    set({ intervaloId: novoId });
  },
  pause: () => {
    set((state: any) => {
      clearInterval(state.intervaloId);
      return {
        ...state,
        intervaloId: null,
      };
    });
  },
  reset: () => {
    set((state:any)=>{
      clearInterval(state.intervaloId);
      return{ intervaloId: null, elapsed: 0 }
    });
  },
}));

function add() {
  cronometerStore.setState((state: any) => ({elapsed: state.elapsed + 1,}));
}
