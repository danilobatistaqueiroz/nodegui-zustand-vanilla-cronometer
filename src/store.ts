import {createStore} from "zustand/vanilla";
import { persist, createJSONStorage, subscribeWithSelector } from 'zustand/middleware'

import Storage from "node-storage";
var localStorage = new Storage('./storage.json');

class Theme {
  theme:string="Dracula"
  fontColor:string="rgb(214, 174, 204)"
  backgroundColor:string="rgb(80, 4, 33)"
  displayFontColor:string="rgb(177, 1, 59)"
}

const theme = new Theme()

const oneStorage = {
  getItem: (key: string) => localStorage.get(key),
  setItem: (key: string, value: string) => localStorage.put(key, value),
  removeItem: (key: string) => localStorage.remove(key),
}

export const cronometerStore: any = createStore(subscribeWithSelector(persist(
  (set) => (
  {
    intervaloId: null,
    elapsed: 0,

    selectedTheme: theme,

    setTheme: (value:Theme) => {
      set({ selectedTheme: value })
    },
    setElapsed: (value:number=1) => {
      set({ elapsed: value })
    },
    start: () => {
      add()
      const novoId = setInterval(add, 1000);
      set({ intervaloId: novoId });
    },
    resume: () => {
      add()
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
  } //I had to remove intervaloId, because it isn't useful, its useless to restart the timer, elapsed is enough, and because intervaloId is a NodeJS.Timer and JSON.stringify emmit warning when parsing it.
  ),{name: 'datainfo', partialize: (state:any) => ({ elapsed: state.elapsed, selectedTheme: state.selectedTheme, }), storage: createJSONStorage(() => oneStorage)})
  ));

function add() {
  cronometerStore.setState((state: any) => ({elapsed: state.elapsed + 1,}));
}
