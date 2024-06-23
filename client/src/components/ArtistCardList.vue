<script setup lang="ts">
import { type Artist, getTopArtists } from '@/model/spotify';
import ArtistCard from '../components/ArtistCard.vue';
import { ref, onMounted, computed } from 'vue';

const allArtists = ref<Artist[]>([]);
const visibleArtists = ref<Artist[]>([]);
const visibleCount = 9; // Including the central card and two cards on each side
const baseScale = 1.0;
const scaleDecrement = 0.11;
const minimumScale = 0.6;

onMounted(async () => {
    const artists = await getTopArtists();
    allArtists.value = artists;
    updateVisibleArtists();
});

function calculateScale(index: number, centerIndex: number) {
    const distanceFromCenter = Math.abs(index - centerIndex);
    return Math.max(baseScale - scaleDecrement * distanceFromCenter, minimumScale);
}

function updateVisibleArtists() {
    const centerIndex = Math.floor(allArtists.value.length / 2);
    const start = Math.max(centerIndex - Math.floor(visibleCount / 2), 0);
    const end = Math.min(start + visibleCount, allArtists.value.length);
    visibleArtists.value = allArtists.value.slice(start, end);
}

const artistStyles = computed(() => {
    const centerIndex = Math.floor(allArtists.value.length / 2);
    return allArtists.value.map((artist, index) => {
        const scale = calculateScale(index, centerIndex);
        const zIndex = index === centerIndex ? 200 : 100 - Math.abs(index - centerIndex);
        const translateX = (index - centerIndex) * 110; // Adjusted for better alignment
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
    allArtists.value.push(allArtists.value.shift()!);
    updateVisibleArtists();
}

function scrollRight() {
    allArtists.value.unshift(allArtists.value.pop()!);
    updateVisibleArtists();
}
</script>

<template>
    <div class="row align-items-center justify-content-center" style="position: relative;">
        <div class="col-auto">
            <button class="btn btn-secondary circle-btn" @click="scrollRight">
                <i class="fa-solid fa-chevron-left"></i>
            </button>
        </div>
        <div class="col artist-display-container" style="overflow: hidden; position: relative; height: 399px;">
            <ArtistCard 
                v-for="{ artist, style } in artistStyles" 
                :key="artist.id" 
                :artist="artist" 
                :style="style" 
            />
        </div>
        <div class="col-auto">
            <button class="btn btn-secondary circle-btn" @click="scrollLeft">
                <i class="fa-solid fa-chevron-right"></i>
            </button>
        </div>
    </div>
</template>

<style scoped>
.artist-display-container {
    overflow: hidden;
    position: relative;
    height: 399px;
    width: 100%;
}

.artist-display-container > * {
    flex: 0 0 auto;
    position: absolute;
    transition: transform 0.4s, z-index 0.4s; 
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
