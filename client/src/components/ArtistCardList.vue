<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { type Artist, getTopArtists } from '@/model/spotify';
import ArtistCard from '../components/ArtistCard.vue';

const allArtists = ref<Artist[]>([]);
const centerIndex = ref(0);
const baseScale = 1.0;
const scaleDecrement = 0.11;
const minimumScale = 0.6;
let scrollInterval: number | null | undefined = null;

onMounted(async () => {
    const artists = await getTopArtists();
    allArtists.value = artists;
});

function calculateScale(index: number) {
    const distanceFromCenter = Math.abs(index - centerIndex.value);
    return Math.max(baseScale - scaleDecrement * distanceFromCenter, minimumScale);
}

const artistStyles = computed(() => {
    return allArtists.value.map((artist, index) => {
        const scale = calculateScale(index);
        const zIndex = index === centerIndex.value ? 200 : 100 - Math.abs(index - centerIndex.value);
        const translateX = (index - centerIndex.value) * 110;
        return {
            artist,
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
    if (centerIndex.value < allArtists.value.length - 1) centerIndex.value++;
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
                @mouseup="stopScrolling" @mouseleave="stopScrolling">
                <i class="fa-solid fa-chevron-left"></i>
            </button>
        </div>
        <div class="col artist-display-container" style="overflow: hidden; position: relative; height: 380px;">
            <ArtistCard class="card-hover" v-for="(item, index) in artistStyles" :key="item.artist.id" :artist="item.artist"
                :style="item.style" :listIndex="index" :centerIndex="centerIndex" />
        </div>
        <div class="col-auto">
            <button class="btn btn-secondary circle-btn" @mousedown="startScrolling(scrollRight)"
                @mouseup="stopScrolling" @mouseleave="stopScrolling">
                <i class="fa-solid fa-chevron-right"></i>
            </button>
        </div>
    </div>
</template>

<style scoped>
.artist-display-container {
    overflow: hidden;
    position: relative;
    height: 380px;
    width: 100%;
}

.artist-display-container > * {
    flex: 0 0 auto;
    position: absolute;
}

.card-hover {
    transition: transform 0.4s, z-index 0.4s, box-shadow 0.3s; /* Combine transitions */
}

.card-hover:hover {
    box-shadow: 0px 0px 30px rgba(0, 0, 0, 1);
}

.artist-display-container::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to right, #121212 0%, transparent 25%, transparent 75%, #121212 100%);
    pointer-events: none;
    z-index: 200;
}
</style>
