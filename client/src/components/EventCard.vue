<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { type Event } from '@/model/ticketmaster';
import { getGoogleEvents, deleteGoogleEvent, googleEventExists } from '@/model/google';

const props = defineProps<{
    event: Event;
    listIndex: number;
    centerIndex: number;
}>();

const emit = defineEmits(['data']);

const isAlreadyAdded = ref(false);
const isChecked = ref(false);
const checkboxId = `addEventCheckbox-${props.event.id}`;
const buttonStyle = ref({
    backgroundColor: '#111111',
    borderColor: '#111111',
    color: '#ffffff'
});

const artistModal = document.getElementById('eventArtistModal');
const genreModal = document.getElementById('eventGenreModal');

onMounted(() => {
    checkIfAlreadyAdded();
    artistModal?.addEventListener('show.bs.modal', () => {
        checkIfAlreadyAdded();
    });
    artistModal?.addEventListener('hidden.bs.modal', () => {
        isChecked.value = false;
        buttonStyle.value.backgroundColor = '#111111';
        buttonStyle.value.borderColor = '#111111';
        buttonStyle.value.color = '#ffffff';
    });

    genreModal?.addEventListener('show.bs.modal', () => {
        checkIfAlreadyAdded();
    });
    genreModal?.addEventListener('hidden.bs.modal', () => {
        isChecked.value = false;
        buttonStyle.value.backgroundColor = '#111111';
        buttonStyle.value.borderColor = '#111111';
        buttonStyle.value.color = '#ffffff';
    });

    window.addEventListener('update-google-events', () => {
        checkIfAlreadyAdded();
    });
});

const buttonProps = computed(() => {
    if (isAlreadyAdded.value) {
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

const checkIfAlreadyAdded = async () => {
    isAlreadyAdded.value = await googleEventExists(props.event.id);

    if (!isAlreadyAdded.value) {
        isChecked.value = false;
        buttonStyle.value.backgroundColor = '#111111';
        buttonStyle.value.borderColor = '#111111';
        buttonStyle.value.color = '#ffffff';
    }
}

const handleDeleteGoogleEvent = async () => {
    await deleteGoogleEvent(props.event.id);
    checkIfAlreadyAdded();

    const googleEvents = await getGoogleEvents();
    window.dispatchEvent(new CustomEvent('update-google-events', { detail: googleEvents }));
};

const biggestImage = computed(() => {
    if (!props.event.images) return '';

    let biggestImage = props.event.images[0];
    let biggestSize = 0;

    for (const image of props.event.images) {
        if (!image.width || !image.height || image.url.includes("124761")) continue;

        const size = image.width * image.height;

        if (size > biggestSize) {
            biggestImage = image;
            biggestSize = size;
        }
    }

    return biggestImage.url;
});

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
</script>

<template>
    <div class="card d-flex flex-column align-items-center" style="width: 14rem; position: relative;"
        :class="{ 'card-added': isAlreadyAdded }">
        <h5 class="mt-2 mx-3 text-center truncate">{{ props.event.name }}</h5>
        <a :href="props.event.url" target="_blank" class="text-decoration-none text-dark"
            :class="{ disabled: props.listIndex !== props.centerIndex }">
            <template v-if="props.listIndex === props.centerIndex">
                <div v-tooltip="{ content: 'Buy Tickets', theme: 'tooltip-top' }" class="image-container"
                    style="margin-top: 2.5rem;">
                    <img v-if="props.event.images && props.event.images.length > 0" :src="biggestImage"
                        class="event-image" alt="Event Image">
                </div>
            </template>
            <template v-else>
                <div class="image-container" style="margin-top: 2.5rem;">
                    <img v-if="props.event.images && props.event.images.length > 0" :src="biggestImage"
                        class="event-image" alt="Event Image">
                </div>
            </template>
        </a>
        <div class="card-body pt-0 d-flex flex-column justify-content-end align-items-center" style="height: 100%;">
            <p class="my-2 w-100">
            <div class="truncate-event">
                <span class="name-with-colon">{{ props.event.name }}:</span>
            </div>
            <div class="truncate-event-body">
                {{ props.event.dates.start.localDate }}
                in
                {{ props.event._embedded?.venues[0]?.city?.name || 'TBA' }},
                {{ props.event._embedded?.venues[0]?.state?.stateCode ?
                    props.event._embedded?.venues[0]?.state?.stateCode :
                    (props.event._embedded?.venues[0]?.country ?
                        props.event._embedded?.venues[0]?.country.name : 'TBA') }}
            </div>
            </p>
            <div class="form-check mt-auto me-4">
                <div class="d-flex justify-content-center">
                    <button :class="['btn', buttonProps.btnClass, 'circle-button']" @click="buttonProps.action">
                        <transition name="fade" mode="out-in">
                            <div :key="buttonProps.text">
                                <i :class="['fa-solid', buttonProps.iconClass]" v-if="buttonProps.iconClass"></i>
                                {{ buttonProps.text }}
                            </div>
                        </transition>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}

.circle-button {
    width: 140px;
    transition: background-color 0.5s ease, border-color 0.5s ease;
}

.card-added {
    border: 2px solid #1db954 !important;
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

.event-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
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
