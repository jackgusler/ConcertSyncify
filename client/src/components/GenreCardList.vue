<script setup lang="ts">
import { type Genre, getTopGenres } from '@/model/spotify';
import { onMounted, ref, computed } from 'vue';
import GenreCard from './GenreCard.vue';

const allGenres = ref<Genre[]>([]);
const centerIndex = ref(0);
const baseScale = 1.0;
const scaleDecrement = 0.11;
const minimumScale = 0.6;
let scrollInterval: number | null | undefined = null;

onMounted(async () => {
    const genres = await getTopGenres();
    allGenres.value = genres;
});

function calculateScale(index: number) {
    const distanceFromCenter = Math.abs(index - centerIndex.value);
    return Math.max(baseScale - scaleDecrement * distanceFromCenter, minimumScale);
}

const genreStyles = computed(() => {
    return allGenres.value.map((genre, index) => {
        const scale = calculateScale(index);
        const zIndex = index === centerIndex.value ? 200 : 100 - Math.abs(index - centerIndex.value);
        const translateX = (index - centerIndex.value) * 110;
        return {
            genre,
            style: {
                transform: `scale(${scale}) translateX(${translateX}px)`,
                zIndex: zIndex,
                left: '196px',
                top: 0,
                position: 'absolute',
            }
        };
    });
});

function scrollLeft() {
    if (centerIndex.value > 0) centerIndex.value--;
}

function scrollRight() {
    if (centerIndex.value < allGenres.value.length - 1) centerIndex.value++;
}

function startScrolling(directionFunction: () => void) {
    stopScrolling();
    directionFunction();
    scrollInterval = setInterval(directionFunction, 200);
}

function stopScrolling() {
    if (scrollInterval) {
        clearInterval(scrollInterval);
        scrollInterval = null;
    }
}
</script>

<template>
    <div class="row mt-2 align-items-center justify-content-center" style="position: relative;">
        <div class="col-auto">
            <button class="btn btn-secondary circle-btn" @mousedown="startScrolling(scrollLeft)"
                @mouseup="stopScrolling" @mouseleave="stopScrolling" :disabled="centerIndex === 0">
                <i class="fa-solid fa-chevron-left"></i>
            </button>
        </div>
        <div class="col list-display-container">
            <GenreCard class="card-hover" v-for="(item, index) in genreStyles" :key="item.genre.artist.id"
                :genre="item.genre" :style="item.style" :listIndex="index" :centerIndex="centerIndex" />
        </div>
        <div class="col-auto">
            <button class="btn btn-secondary circle-btn" @mousedown="startScrolling(scrollRight)"
                @mouseup="stopScrolling" @mouseleave="stopScrolling" :disabled="centerIndex === allGenres.length - 1">
                <i class="fa-solid fa-chevron-right"></i>
            </button>
        </div>
    </div>
</template>

<style scoped></style>