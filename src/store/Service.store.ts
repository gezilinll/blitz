import { defineStore } from 'pinia';
import { BoardService } from '../board/BoardPanelService';
import { CollabPanelService } from '../collab/CollabPanelService';

interface State {
    board?: BoardService;
    collab?: CollabPanelService;
}

export const useServiceStore = defineStore('services', {
    state: (): State => {
        return {
            board: undefined,
        };
    },
    actions: {},
});
