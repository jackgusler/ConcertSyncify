<script setup lang="ts">
import { getTopGenres } from '@/model/spotify';
import { onMounted, ref, nextTick } from 'vue';
const genres = ref<string[]>([]);

onMounted(async () => {
    const topGenres = await getTopGenres();
    genres.value = topGenres;
    console.log(genres.value); // Now logs the updated array
});
</script>

<template>
    <div>

    </div>
</template>

<style scoped>

</style>