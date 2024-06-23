<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { type Artist, getTopArtists } from '@/model/spotify';
import ArtistCardList from '../components/ArtistCardList.vue';
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

            <div class="col-md-7 d-flex flex-column">
                <div class="row flex-grow-1" style="height: calc(50vh - .8rem); margin-bottom: .6rem;">
                    <div class="box px-3 py-2 rounded-3">
                        <div class="row">
                            <div class="col-auto">
                                <h1>Artists</h1>
                            </div>
                            <div class="col">
                                <div class="input-group">
                                    <input type="text" class="form-control" placeholder="Search for artists"
                                        aria-label="Search for artists" aria-describedby="button-addon2">
                                    <button class="btn btn-outline-secondary" type="button" id="button-addon2">
                                        Search
                                    </button>
                                </div>
                            </div>
                        </div>
                        <ArtistCardList />
                    </div>
                </div>
                <div class="row flex-grow-1" style="height: calc(50vh - .8rem);">
                    <div class="box px-3 py-2 rounded-3">
                        <div class="row">
                            <div class="col-auto">
                                <h1>Genres</h1>
                            </div>
                            <div class="col">
                                <div class="input-group">
                                    <input type="text" class="form-control" placeholder="Search for genres"
                                        aria-label="Search for genres" aria-describedby="button-addon2">
                                    <button class="btn btn-outline-secondary" type="button" id="button-addon2">
                                        Search
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>

            <div class="col-md-4 d-flex">
                <div class="box px-3 py-2 rounded-3 w-100">
                    <h1>Calendar</h1>

                </div>
            </div>

        </div>
    </div>
</template>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 1rem);
}

.row {
    --bs-gutter-x: 1.2rem;
    justify-content: center;
}
</style>