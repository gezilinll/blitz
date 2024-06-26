<template>
    <div class="fullscreen" ref="interactionContainer">
        <ResizeElement
            v-model="selectedElements"
            v-if="selectedElements.length > 0"
        ></ResizeElement>
    </div>
</template>

<script setup lang="ts">
import { useBoardStore } from '@blitz/editor';
import { Point } from '@blitz/store';
import { useDrag, useMove, usePinch, useWheel } from '@vueuse/gesture';
import { onMounted, Ref, ref, watch } from 'vue';

import { ResizeElement } from './resize';

const interactionContainer: Ref<HTMLDivElement | null> = ref(null);

const editorStore = useBoardStore();
const editor = editorStore.editor;

let selectedElements: Ref<string[]> = ref([]);

onMounted(() => {
    interactionContainer.value!.addEventListener('click', (event) => {
        editor.events.click.next({
            globalX: event.clientX,
            globalY: event.clientY,
        });
    });

    editor.events.selectElement.subscribe((elements) => {
        selectedElements.value = [];
        selectedElements.value.push(elements[0].id);
    });

    editor.events.unselectElement.subscribe(() => {
        selectedElements.value = [];
    });

    watch(
        () => editorStore.mouseType,
        () => {
            if (selectedElements.value.length > 0) {
                editor.unselectElement(editor.getElement(selectedElements.value[0])!);
            }
        }
    );
});

const cancelEvent = (e: Event) => e.preventDefault();
window.addEventListener('wheel', cancelEvent, { passive: false });
const gestureState: { pinching: boolean; wheeling: boolean } = { pinching: false, wheeling: false };

const pinchHandler = ({
    offset: [d, _a],
    previous: [pd, _pa],
    origin: [ox, oy],
    pinching,
}: {
    offset: [d: number, a: number];
    previous: [d: number, a: number];
    origin: [ox: number, oy: number];
    pinching: boolean;
}) => {
    gestureState.pinching = pinching;
    if (!pinching) {
        return;
    }
    const scaleOffset = ((d - pd) / 50 / 10) * editorStore.renderer.viewportParam.scale;
    const result = Math.max(
        0.1,
        Math.min(4, editorStore.renderer.viewportParam.scale + scaleOffset)
    );
    editor.scale(result, new Point(ox, oy));
};
usePinch(pinchHandler, {
    domTarget: interactionContainer,
    eventOptions: {
        capture: true,
        passive: false,
    },
});

const wheelHandler = ({
    offset: [x, y],
    previous: [px, py],
    wheeling,
}: {
    offset: [d: number, a: number];
    previous: [d: number, a: number];
    wheeling: boolean;
}) => {
    gestureState.wheeling = wheeling;
    if (gestureState.wheeling && !gestureState.pinching) {
        editor.move(px - x, py - y);
    }
};
useWheel(wheelHandler, {
    domTarget: interactionContainer,
});

const lastDragState: { x: number; y: number; dragging: boolean } = { x: 0, y: 0, dragging: false };
const dragHandler = ({
    first,
    last,
    initial: [ix, iy],
    movement: [mx, my],
}: {
    first: boolean;
    last: boolean;
    initial: [x: number, y: number];
    movement: [x: number, y: number];
}) => {
    if (last) {
        lastDragState.x = 0;
        lastDragState.y = 0;
        lastDragState.dragging = false;
        if (editorStore.mouseType !== 'grab') {
            editor.events.dragEnd.next({ type: editorStore.mouseTypeToElementType() });
        }
        return;
    }
    if (editorStore.mouseType === 'grab') {
        editor.move(mx - lastDragState.x, my - lastDragState.y);
    } else if (!first) {
        if (!lastDragState.dragging) {
            lastDragState.dragging = true;
            editor.events.dragStart.next({
                globalX:
                    (-editorStore.renderer.viewportParam.left + ix) /
                    editorStore.renderer.viewportParam.scale,
                globalY:
                    (-editorStore.renderer.viewportParam.top + iy) /
                    editorStore.renderer.viewportParam.scale,
                type: editorStore.mouseTypeToElementType(),
            });
        }
        editor.events.dragging.next({
            movementX: mx / editorStore.renderer.viewportParam.scale,
            movementY: my / editorStore.renderer.viewportParam.scale,
            type: editorStore.mouseTypeToElementType(),
        });
    }

    lastDragState.x = mx;
    lastDragState.y = my;
};
useDrag(dragHandler, {
    domTarget: interactionContainer,
});

const moveHandler = ({
    event: { clientX, clientY },
}: {
    event: { clientX: number; clientY: number };
}) => {
    editor.events.hovering.next({
        globalX: clientX,
        globalY: clientY,
    });
};
useMove(moveHandler, {
    domTarget: interactionContainer,
});
</script>

<style lang="less">
.fullscreen {
    position: absolute;
    width: 100vw;
    height: 100vh;
}
</style>
