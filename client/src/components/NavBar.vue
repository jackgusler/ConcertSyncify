<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
    <nav class="navbar navbar-expand-lg bg-body-tertiary">
        <div class="container-fluid">
            <!-- <a class="navbar-brand" href="#">Navbar</a> -->
            <RouterLink to="/" class="navbar-brand">Navbar</RouterLink>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item">

                        <RouterLink to="/" class="nav-link">Home</RouterLink>
                    </li>
                    <li class="nav-item">
                        <RouterLink to="/stats" class="nav-link">Stats</RouterLink>
                    </li>
                    <!-- <li class="nav-item">
                        <RouterLink to="/concerts" class="nav-link">Concerts</RouterLink>
                    </li> -->
                </ul>
            </div>
        </div>
    </nav>
</template>

<style scoped>
/* Additional styles if needed */
</style>