import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Page } from '@/lib/schema/page';
import type { RootState } from '../store';

interface PublishResult {
    version: string;
    changelog: string;
}

interface PublishState {
    status: 'idle' | 'loading' | 'success' | 'error';
    result: PublishResult | null;
    error: string | null;
}

const initialState: PublishState = {
    status: 'idle',
    result: null,
    error: null,
};

export const publishDraft = createAsyncThunk<
    PublishResult,
    string,
    { state: RootState; rejectValue: string }
>('publish/publishDraft', async (slug, { getState, rejectWithValue }) => {
    const draft = getState().draftPage.page;
    if (!draft) return rejectWithValue('No draft loaded');

    const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, draft } satisfies { slug: string; draft: Page }),
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        return rejectWithValue(body.error ?? `Publish failed (${res.status})`);
    }

    return res.json();
});

export const publishSlice = createSlice({
    name: 'publish',
    initialState,
    reducers: {
        resetPublish(state) {
            state.status = 'idle';
            state.result = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(publishDraft.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(publishDraft.fulfilled, (state, action) => {
                state.status = 'success';
                state.result = action.payload;
            })
            .addCase(publishDraft.rejected, (state, action) => {
                state.status = 'error';
                state.error = action.payload ?? 'Unknown error';
            });
    },
});

export const { resetPublish } = publishSlice.actions;
export default publishSlice.reducer;
