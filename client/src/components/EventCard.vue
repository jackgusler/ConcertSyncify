<script setup lang="ts">
import { type Event } from '@/model/ticketmaster';
import { onMounted, ref, computed } from 'vue';

const props = defineProps<{
    event: Event;
    listIndex: number;
    centerIndex: number;
}>();

const emit = defineEmits(['data']);

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
    artistModal?.addEventListener('hidden.bs.modal', () => {
        isChecked.value = false;
        buttonStyle.value.backgroundColor = '#111111';
        buttonStyle.value.borderColor = '#111111';
        buttonStyle.value.color = '#ffffff';
    });
    genreModal?.addEventListener('hidden.bs.modal', () => {
        isChecked.value = false;
        buttonStyle.value.backgroundColor = '#111111';
        buttonStyle.value.borderColor = '#111111';
        buttonStyle.value.color = '#ffffff';
    });
});

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
    <div class="card d-flex flex-column align-items-center" style="width: 14rem; position: relative;">
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
            <p class="my-2">
            <div class="truncate-event">
                <span class="name-with-colon">{{ props.event.name }}:</span>
            </div>
            <span style="color: #6d6d6d;">
                {{ props.event.dates.start.localDate }}
                in
                {{ props.event._embedded?.venues[0]?.city?.name || 'Unknown' }},
                {{ props.event._embedded?.venues[0]?.state?.stateCode ?
                    props.event._embedded?.venues[0]?.state?.stateCode :
                    (props.event._embedded?.venues[0]?.country ?
                        props.event._embedded?.venues[0]?.country.name : 'Unknown') }}
            </span>
            </p>
            <div class="form-check mt-auto me-4">
                <label :for="checkboxId" :class="['btn', isChecked ? 'btn-success' : 'btn-black', 'circle-button']"
                    :style="buttonStyle">
                    <input class="form-check-input" type="checkbox" :id="checkboxId" style="display: none;"
                        @change="toggleCheckbox">
                    <transition name="icon-switch" mode="out-in">
                        <i :key="isChecked ? 'checked' : 'not-checked'"
                            :class="isChecked ? 'fa-solid fa-check me-2' : 'fa-solid fa-plus me-2'"></i>
                    </transition>
                    <transition name="text-fade" mode="out-in">
                        <span :key="isChecked ? 'Added' : 'Add'">
                            {{ isChecked ? 'Added' : 'Add' }}
                        </span>
                    </transition>
                </label>
            </div>
        </div>
    </div>
</template>

<style scoped>
.disabled {
    cursor: default;
    pointer-events: none;
}

.circle-button {
    width: 120px;
    transition: background-color 0.5s ease, border-color 0.5s ease, color 0.5s ease;
}

.icon-switch-enter-active,
.icon-switch-leave-active {
    transition: opacity 0.3s;
}

.icon-switch-enter,
.icon-switch-leave-to {
    opacity: 0;
}

.text-fade-enter-active,
.text-fade-leave-active {
    transition: opacity 0.3s;
}

.text-fade-enter,
.text-fade-leave-to {
    opacity: 0;
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