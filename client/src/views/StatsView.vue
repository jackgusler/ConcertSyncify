<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { type Artist, getTopArtists } from '@/model/spotify';

const topArtists = ref<Artist[]>([]);

onMounted(() => {
    getTopArtists().then((artists) => {
        topArtists.value = artists;
    });
});
</script>

<template>
    <div>
        <h1>Stats View</h1>
        <div v-if="topArtists.length">
            <h2>Your Top Artists</h2>
            <ul>
                <li v-for="artist in topArtists" :key="artist.id">
                    {{ artist.name }}
                </li>
            </ul>
        </div>
        <div v-else>
            <p>Loading...</p>
        </div>
    </div>
</template>

<style scoped>
/* Add any necessary styles */
</style>
