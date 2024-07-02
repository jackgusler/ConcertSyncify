<script setup lang="ts">
import { ref, watch } from 'vue';
import { type Artist, type Genre, searchSpotify } from '@/model/spotify';

const props = defineProps<{
    type: string;
}>();

const emit = defineEmits(['search-results']);

const searchBar = ref(false);
const searchInput = ref('');
const searchInputRef = ref<HTMLInputElement | null>(null);
const searchResultsArtists = ref<Artist[]>([]);
const searchResultsGenres = ref<Genre[]>([]);

const toggleSearchbar = () => {
    searchBar.value = !searchBar.value;

    if (!searchBar.value) {
        searchInput.value = '';
    } else {
        searchInputRef.value?.focus();
    }
};

watch(searchInput, async (newVal) => {
    if (props.type === 'artist') {
        if (newVal.length > 2) {
            const artists = await searchSpotify(newVal, 'artist');
            searchResultsArtists.value = artists;
            emit('search-results', searchResultsArtists.value);
        } else {
            searchResultsArtists.value = [];
            emit('search-results', searchResultsArtists.value);
        }
    }
    else if (props.type === 'genre') {
        if (newVal.length > 2) {
            const genres = await searchSpotify(newVal, 'genre');
            searchResultsGenres.value = genres;
            emit('search-results', searchResultsGenres.value);
        } else {
            searchResultsGenres.value = [];
            emit('search-results', searchResultsGenres.value);
        }
    }
});

</script>

<template>
    <div class="search-content" :class="['position-relative', { 'start': searchBar, 'end': !searchBar }]">
        <div class="search-icon-container" @click="toggleSearchbar">
            <i v-if="!searchBar" class="fa-solid fa-caret-left arrow-left"></i>
            <i class="fa-solid fa-magnifying-glass fa-2x search-icon"></i>
            <i v-if="searchBar" class="fa-solid fa-caret-right arrow-right"></i>
        </div>
        <div class="search-bar-container" :class="{ 'hidden': !searchBar, 'visible': searchBar }">
            <input ref="searchInputRef" type="text" class="form-control" placeholder="Search"
                :class="{ 'input-to-component': searchInput.length > 2 }" v-model="searchInput" />
        </div>
    </div>
</template>

<style scoped>
.search-container {
    position: relative;
    height: 100%;
}

.search-content {
    position: absolute;
    width: calc(100% - .65rem);
    display: flex;
    align-items: center;
    position: relative;
    transition: transform 0.5s ease;
}

.search-content.start {
    transform: translateX(0%);
}

.search-content.end {
    transform: translateX(calc(100% - 2.5rem));
}

.search-icon-container {
    display: flex;
    align-items: center;
    cursor: pointer;
    color: white;
    transition: color 0.3s;
}

.search-icon-container .fa-magnifying-glass {
    transition: transform 0.5s ease;
}

.search-icon-container .fa-magnifying-glass {
    transform: rotate(90deg);
}

.search-content.start .search-icon {
    transform: rotate(0deg);
}

.arrow-left,
.arrow-right {
    opacity: 0;
    transition: all 0.3s;
}

.search-icon-container:hover .arrow-left {
    opacity: 1;
    transform: translateX(-5px);
}

.search-icon-container:hover .arrow-right {
    opacity: 1;
    transform: translateX(5px);
}

.search-bar-container {
    width: 100%;
    transition: opacity 0.5s;
    margin-left: 1rem;
}

.search-bar-container.hidden {
    opacity: 0;
}

.search-bar-container.visible {
    opacity: 1;
}

input::placeholder {
    color: #323231;
}

.form-control {
    background-color: black;
    border: none;
    border-radius: 40px;
    color: white;
    box-shadow: none;
    padding-left: 20px;
    padding-right: 20px;
}
</style>