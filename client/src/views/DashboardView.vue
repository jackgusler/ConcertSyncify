<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { type Artist, searchSpotify } from '@/model/spotify';
import { googleLogout, isLoggedInGoogle } from '../model/google';
import ArtistCardList from '../components/ArtistCardList.vue';
import GenreCardList from '../components/GenreCardList.vue';
import Calendar from '../components/Calendar.vue';
import SearchResults from '../components/SearchResults.vue';

const artistSearchBar = ref(false);
const artistSearchInput = ref('');
const artistSearchResults = ref<Artist[]>([]);
const artistSearchInputRef = ref<HTMLInputElement | null>(null);

const genreSearchBar = ref(false);
const genreSearchInput = ref('');
const genreSearchResults = ref<Artist[]>([]);
const genreSearchInputRef = ref<HTMLInputElement | null>(null);

const loggedIn = ref(false);

onMounted(async () => {
    const isLogged = await isLoggedInGoogle();
    loggedIn.value = isLogged;

    artistSearchBar.value = false;
    genreSearchBar.value = false;
});

watch(artistSearchInput, async (newVal) => {
    if (newVal.length > 2) {
        const artists = await searchSpotify(newVal, 'artist');
        artistSearchResults.value = artists;

        console.log(artistSearchResults.value);
    } else {
        artistSearchResults.value = [];
    }
});

watch(genreSearchInput, async (newVal) => {
    if (newVal.length > 2) {
        const genres = await searchSpotify(newVal, 'genre');
        genreSearchResults.value = genres;

        console.log(genreSearchResults.value);
    } else {
        genreSearchResults.value = [];
    }
});

const toggleArtistSearchbar = () => {
    artistSearchBar.value = !artistSearchBar.value;
    if (artistSearchBar.value) {
        setTimeout(() => {
            artistSearchInputRef.value?.focus();
        }, 500);
    }
};

const toggleGenreSearchbar = () => {
    genreSearchBar.value = !genreSearchBar.value;
    if (genreSearchBar.value) {
        setTimeout(() => {
            genreSearchInputRef.value?.focus();
        }, 500);
    }
};
</script>

<template>
    <div class="container mt-2">
        <div class="row h-100">

            <div class="col-md-1 d-flex justify-content-center align-items-center">
                <div class="box p-3 rounded-3 w-100 d-flex justify-content-center align-items-center">
                    <router-link to="/" class="btn btn-secondary circle-btn">
                        <i class="fa-solid fa-house"></i>
                    </router-link>
                </div>
            </div>

            <div class="col-md-7 d-flex flex-column position-relative">
                <div class="row flex-grow-1" style="height: calc(50vh - .8rem); margin-bottom: .6rem;">
                    <div class="box px-3 py-2 rounded-3">
                        <div class="row align-items-center overflow-hidden">
                            <div class="col-auto">
                                <h1>Artists</h1>
                            </div>
                            <div class="search-container col">
                                <div class="search-content"
                                    :class="['position-relative', { 'start': artistSearchBar, 'end': !artistSearchBar }]">
                                    <div class="search-icon-container">
                                        <i v-if="!artistSearchBar" class="fa-solid fa-caret-left arrow-left"></i>
                                        <i class="fa-solid fa-magnifying-glass fa-2x search-icon"
                                            @click="toggleArtistSearchbar"></i>
                                        <i v-if="artistSearchBar" class="fa-solid fa-caret-right arrow-right"></i>
                                    </div>
                                    <div class="search-bar-container"
                                        :class="{ 'hidden': !artistSearchBar, 'visible': artistSearchBar }">
                                        <input ref="artistSearchInputRef" type="text" class="form-control"
                                            placeholder="Search for artists"
                                            :class="{ 'input-to-component': artistSearchInput.length > 2 }"
                                            v-model="artistSearchInput">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <ArtistCardList />
                    </div>
                </div>
                <SearchResults v-if="artistSearchInput.length > 2" :results="artistSearchResults" />
                <div class="row flex-grow-1" style="height: calc(50vh - .8rem);">
                    <div class="box px-3 py-2 rounded-3">
                        <div class="row align-items-center overflow-hidden">
                            <div class="col-auto">
                                <h1>Genres</h1>
                            </div>
                            <div class="search-container col">
                                <div class="search-content"
                                    :class="{ 'start': genreSearchBar, 'end': !genreSearchBar }">

                                    <div class="search-icon-container">
                                        <i v-if="!genreSearchBar" class="fa-solid fa-caret-left arrow-left"></i>
                                        <i class="fa-solid fa-magnifying-glass fa-2x search-icon"
                                            @click="toggleGenreSearchbar"></i>
                                        <i v-if="genreSearchBar" class="fa-solid fa-caret-right arrow-right"></i>
                                    </div>

                                    <div class="search-bar-container"
                                        :class="{ 'hidden': !genreSearchBar, 'visible': genreSearchBar }">
                                        <input ref="genreSearchInputRef" type="text" class="form-control"
                                            placeholder="Search for genres"
                                            :class="{ 'input-to-component': genreSearchInput.length > 2 }"
                                            v-model="genreSearchInput">
                                    </div>

                                </div>
                            </div>
                        </div>
                        <GenreCardList />
                    </div>
                </div>
                <SearchResults v-if="genreSearchInput.length > 2" :results="genreSearchResults" />
            </div>

            <div class="col-md-4 d-flex">
                <div class="box px-3 py-2 rounded-3 w-100">
                    <div class="col-auto d-flex justify-content-between align-items-center">
                        <h1>Calendar</h1>
                        <button v-if="loggedIn" @click="googleLogout" class="btn btn-success">Logout</button>
                    </div>
                    <Calendar />
                </div>
            </div>

        </div>
    </div>
</template>

<style scoped>
input {
    border: 2px solid rgb(0, 0, 0) !important;
}

.input-to-component {
    border: 2px solid rgb(60, 60, 60) !important;
    border-bottom-left-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
    border-top-left-radius: 20px !important;
    border-top-right-radius: 20px !important;
}

.container {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 1rem);
}

.row {
    --bs-gutter-x: 1.2rem;
    justify-content: center;
}

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
