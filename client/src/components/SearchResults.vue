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
    /* Set a maximum height */
    overflow-y: auto;
    /* Enable vertical scrolling */
    background-color: black;
    border-top: none !important;
    border: 2px solid rgb(60, 60, 60);
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
}

.result-card {
    display: flex;
    flex-direction: row;
    /* Change to row for horizontal alignment of image and name within each card */
    align-items: center;
    width: 100%;
    /* Adjust width to 100% to utilize full container width */
    border-bottom: 2px solid rgb(60, 60, 60);
}

.result-card:last-child {
    border-bottom: none;
    /* Remove border from the last card */
}

.result-image {
    width: 75px;
    /* Adjust size as needed */
    height: 75px;
    /* Adjust size as needed */
    margin-right: 1rem;
    /* Add some space between the image and the name */
}

.name {
    font-size: 1.2rem;
    text-align: left;
    /* Align text to the left */
    color: white;
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