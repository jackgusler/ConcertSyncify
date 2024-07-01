<script setup lang="ts">
import { type Artist } from '@/model/spotify';
import { onMounted, onUnmounted, ref } from 'vue';
const props = defineProps<{
    type: string,
    results: Artist[]
}>();

const shouldResize = ref(false);

onMounted(() => {
    window.addEventListener('resize', () => {
        shouldResize.value = true;
    });
});

onUnmounted(() => {
    shouldResize.value = false;
});
</script>

<template>
    <div
        :class="{ 'artist-search-results': props.type === 'artist', 'genre-search-results': props.type === 'genre', 'translate-right': shouldResize, 'hidden': shouldResize, 'visible': !shouldResize }">
        <div v-for="result in props.results" :key="result.id" class="result-card">
            <div class="image-container">
                <img :src="result.images[0]?.url || 'default-image-url.jpg'" alt="Artist Image" class="artist-image" />
            </div>
            <div class="name">{{ result.name }}</div>
        </div>
    </div>
</template>

<style scoped>
.artist-search-results {
    display: flex;
    flex-direction: column;
    margin-top: 1rem;
    max-height: 300px;
    overflow-y: auto;
    border-top: none !important;
    border: 2px solid rgb(60, 60, 60);
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;

    position: absolute;
    width: calc(100% - 14.3rem);
    top: 40px;
    left: 12.65rem;
    z-index: 500;

    transition: opacity 0.5s ease, transform 0.5s ease;
}

.genre-search-results {
    display: flex;
    flex-direction: column;
    margin-top: 1rem;
    max-height: 300px;
    overflow-y: auto;
    border-top: none !important;
    border: 2px solid rgb(60, 60, 60);
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;

    position: absolute;
    width: calc(100% - 15.05rem);
    top: 520px;
    left: 13.4rem;
    z-index: 500;

    transition: opacity 0.5s ease, transform 0.5s ease;
}

.result-card {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    border-bottom: 2px solid rgb(60, 60, 60);
    padding: 1rem;
    background: linear-gradient(to bottom, #242424 0%, #242424 75%, #323231 100%);
}

.result-card:last-child {
    border-bottom: none;
}

.name {
    font-size: 1.2rem;
    text-align: left;
    color: white;
    margin-left: 1rem;
}

.image-container {
    width: 75px;
    height: 75px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: black;
    box-shadow: 0px 0px 30px rgba(0, 0, 0, 1);
}

.artist-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}

.translate-right {
    transform: translateX(100%);
}

.hidden {
    opacity: 0;
}

.visible {
    opacity: 1;
}
</style>
