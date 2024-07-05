<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { type Artist, type Genre } from '@/model/spotify';
import { type Event } from '@/model/ticketmaster';
import { googleLogout, isLoggedInGoogle } from '../model/google';
import EventListModal from '../components/EventListModal.vue';
import CardList from '../components/CardList.vue';
import Calendar from '../components/Calendar.vue';
import SearchBar from '../components/SearchBar.vue';

const modalVisible = ref(false);
const type = ref('');
const eventList = ref<Event[]>([]);
const modalTitle = ref('');

const artistSearchResults = ref<Artist[]>([]);
const genreSearchResults = ref<Genre[]>([]);

const loggedIn = ref(false);

onMounted(async () => {
    loggedIn.value = await isLoggedInGoogle();
});

const handleEmit = (data: { type: string, events: Event[]; modalTitle: string }) => {
    modalVisible.value = true;
    type.value = data.type;
    eventList.value = data.events;
    modalTitle.value = data.modalTitle;
};

const handleSearchEmit = (data: any[], type: string) => {
    if (type === 'artist') {
        artistSearchResults.value = data;
    } else if (type === 'genre') {
        genreSearchResults.value = data;
    }
};

</script>

<template>
    <div class="modal fade" id="eventModal" ref="eventModal" tabindex="-1" aria-labelledby="eventModalLabel"
        aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
            <EventListModal v-if="modalVisible" :type="type" :events="eventList" :modalTitle="modalTitle"
                @modal-closed="modalVisible = false" />
        </div>
    </div>

    <div class="container mt-2">
        <div class="row h-100">

            <div class="col-md-1 d-flex justify-content-center align-items-center custom-margin-home">
                <div class="box p-3 rounded-3 w-100 d-flex justify-content-center align-items-center">
                    <router-link to="/" class="btn btn-secondary circle-btn small-btn">
                        <i class="fa-solid fa-house"></i>
                    </router-link>
                </div>
            </div>

            <div class="col-md-7 d-flex flex-column position-relative overflow-hidden">
                <div class="row box py-2 rounded-3 flex-grow-1 position-relative d-flex justify-content-center align-items-start custom-margin-card-list"
                    style="margin-bottom: .6rem;">
                    <div class="row align-items-center px-3">
                        <div class="col-auto p-0">
                            <h1>Artists</h1>
                        </div>
                        <div class="search-container col p-0 ps-3">
                            <SearchBar :type="'artist'" @search-results="handleSearchEmit($event, 'artist')" />
                        </div>
                    </div>
                    <CardList :type="'artist'" :artists="artistSearchResults" @data="handleEmit" />
                </div>
                <div
                    class="row box py-2 rounded-3 flex-grow-1 position-relative d-flex justify-content-center align-items-start custom-margin-card-list">
                    <div class="row align-items-center px-3">
                        <div class="col-auto p-0">
                            <h1>Genres</h1>
                        </div>
                        <div class="search-container col p-0 ps-3">
                            <SearchBar :type="'genre'" @search-results="handleSearchEmit($event, 'genre')" />
                        </div>
                    </div>
                    <CardList :type="'genre'" :genres="genreSearchResults" @data="handleEmit" />
                </div>
            </div>

            <div class="col-md-4">
                <div class="box px-3 py-2 rounded-3 d-flex flex-column w-100 h-100 custom-margin-calendar">
                    <div class="row justify-content-between align-items-center px-3 pb-2">
                        <div class="col-auto p-0">
                            <h1 class="m-0">Calendar</h1>
                        </div>
                        <div class="col d-flex p-0 justify-content-end custom-logout-container">
                            <button v-if="loggedIn" @click="googleLogout" class="btn btn-success">Logout</button>
                        </div>
                    </div>
                    <div class="d-flex flex-grow-1 justify-content-center align-items-center">
                        <Calendar />
                    </div>
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


@media (max-width: 768px) {
    .custom-margin-home {
        margin-bottom: 0.6rem !important;
    }

    .custom-margin-card-list {
        margin: 0rem !important;
        margin-bottom: 0.6rem !important;
    }

    .custom-margin-calendar {
        margin-bottom: 0.6rem !important;
    }

    .small-btn {
        transform: scale(1) !important;
    }
}

@media (max-width: 992px) {
    .small-btn {
        transform: scale(0.6);
    }
}

@media (min-width: 768px) and (max-width: 1200px) {
    .custom-logout-container {
        justify-content: flex-start !important;
    }
}
</style>
