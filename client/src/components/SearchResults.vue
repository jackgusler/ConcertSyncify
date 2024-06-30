<script setup lang="ts">
import { type Artist } from '@/model/spotify';
const props = defineProps<{
    results: Artist[]
}>();
</script>

<template>
    <div class="search-results">
        <div v-for="result in props.results" :key="result.id" class="result-card">
            <div class="image-container">
                <img :src="result.images[0]?.url || 'default-image-url.jpg'" alt="Artist Image" class="artist-image" />
            </div>
            <div class="name">{{ result.name }}</div>
        </div>
    </div>
</template>

<style scoped>
.search-results {
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
    top: 40px; /* Adjust this value to fit the positioning */
    left: 12.65rem;
    z-index: 500;
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
</style>
