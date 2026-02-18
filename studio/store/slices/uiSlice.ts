import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UiState {
    selectedSectionId: string | null;
}

const initialState: UiState = {
    selectedSectionId: null,
};

export const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        selectSection(state, action: PayloadAction<string>) {
            state.selectedSectionId = action.payload;
        },
        deselectSection(state) {
            state.selectedSectionId = null;
        },
    },
});

export const { selectSection, deselectSection } = uiSlice.actions;
export default uiSlice.reducer;
