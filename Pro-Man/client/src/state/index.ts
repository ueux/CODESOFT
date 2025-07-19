import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface initialStateTypes {
  isSidebarCollapsed: boolean;
  isDarkMode: boolean;
}

// Initialize dark mode based on system preference if available
const systemDarkMode = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-color-scheme: dark)').matches
  : false;

const initialState: initialStateTypes = {
  isSidebarCollapsed: false,
  isDarkMode: systemDarkMode, // Initialize with system preference
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setIsSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isSidebarCollapsed = action.payload;
    },
    setIsDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
      // Persist to localStorage if available
      if (typeof window !== 'undefined') {
        localStorage.setItem('darkMode', String(action.payload));
      }
    },
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
      if (typeof window !== 'undefined') {
        localStorage.setItem('darkMode', String(!state.isDarkMode));
      }
    }
  },
});

export const { setIsSidebarCollapsed, setIsDarkMode, toggleDarkMode } = globalSlice.actions;
export default globalSlice.reducer;