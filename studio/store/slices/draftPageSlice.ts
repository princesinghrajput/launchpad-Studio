import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Page, Section, SectionType } from '@/lib/schema/page';

const STORAGE_PREFIX = 'draft:';

function defaultProps(type: SectionType): Section['props'] {
    switch (type) {
        case 'hero':
            return { heading: 'New Hero Section', subheading: '' };
        case 'featureGrid':
            return { features: [{ title: 'Feature', body: 'Description' }] };
        case 'testimonial':
            return { quote: 'Quote text', author: 'Author' };
        case 'cta':
            return { label: 'Click Here', url: '#' };
    }
}

interface DraftPageState {
    page: Page | null;
    isDirty: boolean;
}

const initialState: DraftPageState = {
    page: null,
    isDirty: false,
};

export const draftPageSlice = createSlice({
    name: 'draftPage',
    initialState,
    reducers: {
        loadPage(state, action: PayloadAction<Page>) {
            const slug = action.payload.slug;
            const saved = loadFromStorage(slug);
            state.page = saved ?? action.payload;
            state.isDirty = saved !== null;
        },

        addSection(state, action: PayloadAction<{ type: SectionType }>) {
            if (!state.page) return;
            const newSection: Section = {
                id: crypto.randomUUID(),
                type: action.payload.type,
                props: defaultProps(action.payload.type),
            } as Section;
            state.page.sections.push(newSection);
            state.isDirty = true;
            persistDraft(state.page);
        },

        removeSection(state, action: PayloadAction<string>) {
            if (!state.page) return;
            state.page.sections = state.page.sections.filter(
                (s) => s.id !== action.payload
            );
            state.isDirty = true;
            persistDraft(state.page);
        },

        moveSection(
            state,
            action: PayloadAction<{ id: string; direction: 'up' | 'down' }>
        ) {
            if (!state.page) return;
            const { id, direction } = action.payload;
            const idx = state.page.sections.findIndex((s) => s.id === id);
            if (idx === -1) return;

            const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
            if (targetIdx < 0 || targetIdx >= state.page.sections.length) return;

            const sections = state.page.sections;
            [sections[idx], sections[targetIdx]] = [sections[targetIdx], sections[idx]];
            state.isDirty = true;
            persistDraft(state.page);
        },

        updateSectionProps(
            state,
            action: PayloadAction<{ id: string; props: Record<string, unknown> }>
        ) {
            if (!state.page) return;
            const section = state.page.sections.find(
                (s) => s.id === action.payload.id
            );
            if (!section) return;

            section.props = {
                ...section.props,
                ...action.payload.props,
            } as Section['props'];
            state.isDirty = true;
            persistDraft(state.page);
        },

        clearDraft(state) {
            if (state.page) {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem(`${STORAGE_PREFIX}${state.page.slug}`);
                }
                state.isDirty = false;
            }
        },
    },
    extraReducers: (builder) => {
        // Reset isDirty when publish succeeds
        builder.addCase(
            'publish/publishDraft/fulfilled',
            (state) => { state.isDirty = false; }
        );
    },
});

/* ── localStorage helpers ─────────────────────────────── */

function persistDraft(page: Page) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(`${STORAGE_PREFIX}${page.slug}`, JSON.stringify(page));
    } catch {
        // storage full or unavailable — fail silently
    }
}

function loadFromStorage(slug: string): Page | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(`${STORAGE_PREFIX}${slug}`);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export const {
    loadPage,
    addSection,
    removeSection,
    moveSection,
    updateSectionProps,
    clearDraft,
} = draftPageSlice.actions;

export default draftPageSlice.reducer;
