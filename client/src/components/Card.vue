<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { type Artist, type Genre, handleLoading } from '@/model/spotify';
import { type Event, getEvents } from '@/model/ticketmaster';
import { getGoogleEvents, deleteGoogleEvent, googleEventExists, isLoggedInGoogle } from '@/model/google';

const props = defineProps<{
    type: string;
    artist?: Artist;
    genre?: Genre;
    event?: Event;
    listIndex: number;
    centerIndex: number;
}>();

const events = ref<Event[]>([]);

const hasEvents = ref(false);

const emit = defineEmits(['data']);

const loggedIn = ref(false);

const isAlreadyAdded = ref(false);
const isChecked = ref(false);
const eventModal = document.getElementById('eventModal');
const buttonStyle = ref({
    backgroundColor: '#111111',
    borderColor: '#111111',
    color: '#ffffff'
});

onMounted(async () => {
    const isLogged = await isLoggedInGoogle();
    loggedIn.value = isLogged;
});

const buttonProps = computed(() => {
    if (isAlreadyAdded.value && loggedIn.value) {
        return {
            btnClass: 'btn-success',
            iconClass: 'fa-calendar-xmark',
            text: 'Remove',
            action: handleDeleteGoogleEvent,
        };
    } else if (isChecked.value) {
        return {
            btnClass: 'btn-success',
            iconClass: 'fa-check',
            text: 'Added',
            action: toggleCheckbox,
        };
    } else {
        return {
            btnClass: 'btn-black',
            iconClass: 'fa-plus',
            text: 'Add',
            action: toggleCheckbox,
        };
    }
});

const biggestImage = computed(() => {
    if (!props.event?.images) return '';

    let biggestImage = props.event?.images[0];
    let biggestSize = 0;

    for (const image of props.event?.images) {
        if (!image.width || !image.height || image.url.includes("124761")) continue;

        const size = image.width * image.height;

        if (size > biggestSize) {
            biggestImage = image;
            biggestSize = size;
        }
    }

    return biggestImage.url;
});

onMounted(async () => {
    if (props.type === 'artist' && props.artist && props.artist.name) {
        handleLoading(props.type, '+');
        const artistEvents = await getEvents(props.artist.name);
        if (artistEvents && artistEvents.length > 0) {
            events.value = artistEvents;
            hasEvents.value = true;
        }
        handleLoading(props.type, '-');
    }

    if (props.type === 'genre' && props.genre && props.genre.genre) {
        handleLoading(props.type, '+');
        let genreEvents = await getEvents(props.genre.genre);
        if (!genreEvents || genreEvents.length === 0) {
            const alternativeGenre = getAlternativeGenre(props.genre.genre);
            genreEvents = await getEvents(alternativeGenre);
        }
        handleLoading(props.type, '-');

        if (genreEvents && genreEvents.length > 0) {
            events.value = genreEvents;
            hasEvents.value = true;
        }
    }

    if (props.type === 'event') {
        checkIfAlreadyAdded();
        eventModal?.addEventListener('show.bs.modal', () => {
            checkIfAlreadyAdded();
        });
        eventModal?.addEventListener('hidden.bs.modal', () => {
            isChecked.value = false;
            buttonStyle.value.backgroundColor = '#111111';
            buttonStyle.value.borderColor = '#111111';
            buttonStyle.value.color = '#ffffff';
        });

        window.addEventListener('update-google-events', () => {
            checkIfAlreadyAdded();
        });
    }
});

const emitData = async () => {
    handleLoading('event', '+');
    if (props.type === 'artist') {

        if (hasEvents.value) {
            emit('data', { type: 'artist', events: events.value, modalTitle: props.artist?.name });
        } else if (props.artist?.genres && props.artist.genres.length > 0) {
            console.log(props.artist.genres[0]);
            const genre = getAlternativeGenre(props.artist.genres[0]);
            const genreEvents = await getEvents(genre);
            if (genreEvents && genreEvents.length > 0) {
                events.value = genreEvents;
                emit('data', { type: 'artist', events: events.value, modalTitle: genre });
            }
        }
    } else if (props.type === 'genre') {
        emit('data', { type: 'genre', events: events.value, modalTitle: props.genre?.genre });
    }
    handleLoading('event', '-');
};

const getAlternativeGenre = (initialGenre: string) => {
    const alternativeGenres: { [key: string]: string } = {
        "pov: indie": "Indie",
        "springfield mo indie": "Indie",
        "electropop": "Electric Pop",
        "scenecore": "Metalcore",
        "speedrun": "Speed Metal",
        // Add more mappings
    };

    return alternativeGenres[initialGenre] || "Alternative"; // Fallback to "Alternative" if no mapping found
}

const formatGenre = (genre: string) => {
    const exceptions = ["mo", "uk", "dj"]; // Add more exceptions as needed
    return genre
        .split(' ')
        .map(word => {
            if (exceptions.includes(word.toLowerCase())) {
                return word.toUpperCase();
            } else {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }
        })
        .join(' ');
}

const checkIfAlreadyAdded = async () => {
    isAlreadyAdded.value = await googleEventExists(props.event!.id);

    if (!isAlreadyAdded.value) {
        isChecked.value = false;
        buttonStyle.value.backgroundColor = '#111111';
        buttonStyle.value.borderColor = '#111111';
        buttonStyle.value.color = '#ffffff';
    }
}

const handleDeleteGoogleEvent = async () => {
    await deleteGoogleEvent(props.event!.id);
    checkIfAlreadyAdded();

    const googleEvents = await getGoogleEvents();
    window.dispatchEvent(new CustomEvent('update-google-events', { detail: googleEvents }));
};

const toggleCheckbox = () => {
    isChecked.value = !isChecked.value;
    if (isChecked.value) {
        buttonStyle.value.backgroundColor = '#1db954';
        buttonStyle.value.borderColor = '#1db954';
    } else {
        buttonStyle.value.backgroundColor = '#111111';
        buttonStyle.value.borderColor = '#111111';
        buttonStyle.value.color = '#ffffff';
    }
    emit('data', props.event);
};

const dateToText = (date: string | undefined) => {
    if (!date) return '';

    // Split the date string into components
    const [year, month, day] = date.split('-').map(part => parseInt(part, 10));

    // Create a new Date object using local time components
    const dateObj = new Date(year, month - 1, day);

    const currentYear = new Date().getFullYear();
    const dateYear = dateObj.getFullYear();

    const monthLong = dateObj.toLocaleString('en-US', { month: 'long' });
    const dayWithOrdinal = getOrdinalIndicator(dateObj.getDate());

    let dateString = `${monthLong} ${dayWithOrdinal}`;
    if (dateYear !== currentYear) {
        dateString += `, ${dateYear}`;
    }

    return dateString;
}

const getOrdinalIndicator = (day: number) => {
    const j = day % 10,
        k = day % 100;
    if (j == 1 && k != 11) {
        return day + "st";
    }
    if (j == 2 && k != 12) {
        return day + "nd";
    }
    if (j == 3 && k != 13) {
        return day + "rd";
    }
    return day + "th";
}

const formatLocation = (venue: any) => {
    let location = [];
    if (venue.city?.name) {
        location.push(venue.city.name);
    }

    if (venue.state?.stateCode) {
        location.push(venue.state.stateCode);
    }

    if (venue.country?.countryCode) {
        location.push(venue.country.countryCode);
    }

    return location.join(', ');
}

</script>

<template>
    <div class="card d-flex flex-column align-items-center"
        :class="{ 'card-added': props.type === 'event' && isAlreadyAdded && loggedIn }">
        <h5 class="mt-2 mx-3 text-center truncate">{{ props.type === 'genre' ? formatGenre(props.genre!.genre) :
            props.type ===
                'artist' ? props.artist?.name : props.type === 'event' ? props.event?.name : '' }}</h5>
        <a v-if="props.type === 'artist'" :href="props.artist?.external_urls.spotify" target="_blank"
            class="text-decoration-none text-dark" :class="{ disabled: props.listIndex !== props.centerIndex }">
            <div class="image-container" style="margin-top: 2.5rem;">
                <template v-if="props.listIndex === props.centerIndex && props.artist?.external_urls.spotify">
                    <img v-tooltip="{ content: 'Open Spotify', theme: 'tooltip-top' }"
                        v-if="props.artist?.images && props.artist.images.length > 0" :src="props.artist.images[0].url"
                        class="image" alt="Artist Image">
                </template>
                <template v-else>
                    <img v-if="props.artist?.images && props.artist.images.length > 0" :src="props.artist.images[0].url"
                        class="image" alt="Artist Image">
                </template>
            </div>
        </a>
        <a v-else-if="props.type === 'genre'" :href="props.genre?.artist.external_urls.spotify" target="_blank"
            class="text-decoration-none text-dark" :class="{ disabled: props.listIndex !== props.centerIndex }">
            <div class="image-container" style="margin-top: 2.5rem;">
                <template v-if="props.listIndex === props.centerIndex && props.genre?.artist.external_urls.spotify">
                    <img v-tooltip="{ content: 'Open Spotify', theme: 'tooltip-top' }"
                        v-if="props.genre?.artist.images && props.genre.artist.images.length > 0"
                        :src="props.genre.artist.images[0].url" class="image" alt="Artist Genre Image">
                </template>
                <template v-else>
                    <img v-if="props.genre?.artist.images && props.genre.artist.images.length > 0"
                        :src="props.genre.artist.images[0].url" class="image" alt="Artist Genre Image">
                </template>
            </div>
        </a>
        <a v-else-if="props.type === 'event'" :href="props.event?.url" target="_blank"
            class="text-decoration-none text-dark" :class="{ disabled: props.listIndex !== props.centerIndex }">
            <template v-if="props.listIndex === props.centerIndex && props.event?.url">
                <div v-tooltip="{ content: 'Buy Tickets', theme: 'tooltip-top' }" class="image-container"
                    style="margin-top: 2.5rem;">
                    <img v-if="props.event?.images && props.event.images.length > 0" :src="biggestImage" class="image"
                        alt="Event Image">
                </div>
            </template>
            <template v-else>
                <div class="image-container" style="margin-top: 2.5rem;">
                    <img v-if="props.event?.images && props.event.images.length > 0" :src="biggestImage" class="image"
                        alt="Event Image">
                </div>
            </template>
        </a>

        <div v-if="props.type != 'event' && hasEvents"
            class="card-body pt-0 d-flex flex-column justify-content-end align-items-center w-100">
            <p class="my-2 w-100">
            <div class="truncate-event">
                <span class="name-with-colon">{{ events[0].name }}:</span>
            </div>
            <!-- <div class="truncate-event-body">
                {{ dateToText(events[0].dates.start.localDate) }}
                in
                {{ events[0]._embedded?.venues[0]?.city?.name || 'TBA' }},
                {{ events[0]._embedded?.venues[0]?.state?.stateCode ?
                    events[0]._embedded?.venues[0]?.state?.stateCode :
                    (events[0]._embedded?.venues[0]?.country ?
                        events[0]._embedded?.venues[0]?.country.name : 'TBA') }}
            </div> -->
            <div class="truncate-event-body">
                {{ dateToText(events[0].dates.start.localDate) }}
                at
                {{ events[0]._embedded && events[0]._embedded.venues[0] ? formatLocation(events[0]._embedded.venues[0])
                    : 'TBA'
                }}
            </div>
            </p>
            <button @click="emitData" class="btn btn-success mt-auto" data-bs-toggle="modal"
                data-bs-target="#eventModal"
                :class="{ 'btn-disabled': props.listIndex !== props.centerIndex, 'btn-enabled': props.listIndex === props.centerIndex }">
                View Events
            </button>
        </div>
        <div v-else-if="props.type != 'event'"
            class="card-body d-flex flex-column justify-content-end align-items-center w-100"
            :class="{ 'pt-0': props.type === 'artist' }">
            <div v-if="props.type === 'artist'">
                <p class="my-4 d-flex justify-content-center align-items-center" style="color: #6d6d6d;">
                    No upcoming events
                </p>
                <button @click="emitData" class="btn btn-success mt-auto" data-bs-toggle="modal"
                    data-bs-target="#eventModal"
                    :class="{ 'btn-disabled': props.listIndex !== props.centerIndex, 'btn-enabled': props.listIndex === props.centerIndex }">
                    View Genre Events
                </button>
            </div>
            <div v-else>
                <button class="btn btn-secondary" disabled>No Events</button>
            </div>
        </div>

        <div v-if="props.type === 'event'"
            class="card-body pt-0 d-flex flex-column justify-content-end align-items-center">
            <p class="my-2 w-100">
            <div class="truncate-event">
                <span class="name-with-colon">{{ props.event?.name }}:</span>
            </div>
            <div class="truncate-event-body">
                {{ dateToText(props.event?.dates.start.localDate) }}
                in
                {{ props.event?._embedded?.venues[0]?.city?.name || 'TBA' }},
                {{ props.event?._embedded?.venues[0]?.state?.stateCode ?
                    props.event._embedded?.venues[0]?.state?.stateCode :
                    (props.event?._embedded?.venues[0]?.country ?
                        props.event._embedded?.venues[0]?.country.name : 'TBA') }}
            </div>
            </p>
            <div class="form-check mt-auto me-4">
                <div class="d-flex justify-content-center">
                    <button :class="['btn', buttonProps.btnClass, 'circle-button event-button']"
                        @click="buttonProps.action">
                        <div :key="buttonProps.text">
                            <i :class="['fa-solid', buttonProps.iconClass]" v-if="buttonProps.iconClass"></i>
                            {{ buttonProps.text }}
                        </div>
                    </button>
                </div>
            </div>
        </div>

    </div>
</template>

<style scoped>
.btn,
.btn.btn-disabled,
.btn.btn-enabled {
    transition: background-color 0.5s ease, opacity 0.5s ease;
}

.btn.btn-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
}

.disabled {
    cursor: default;
    pointer-events: none;
}

.btn-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transition: opacity 0.5s ease;
}

.btn-enabled {
    opacity: 1;
    transition: opacity 0.5s ease;
}

.image-container {
    width: 12rem;
    height: 12rem;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: black;
    box-shadow: 0px 0px 30px rgba(0, 0, 0, 1);
}

.image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}

.event-button {
    width: 140px;
    transition: background-color 0.5s ease, border-color 0.5s ease;
}

.card-added {
    border: 2px solid #1db954 !important;
}

.card-title,
h5,
p {
    color: white;
}

* {
    user-select: none;
}
</style>