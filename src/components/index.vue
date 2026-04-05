// let appName: string = 'fireshape'; //explicit type

// interface Car {
//     year: number;
//     model: string;
//     electric: boolean;
// }

// let myCar: Car;

// myCar.year = 2000;

<script lang="ts" setup>
import { ref } from 'vue'

const count = ref<number>(0)

function increase(): void {
  count.value++
}
</script>

<template>
  <button @click="increase">{{ count }}</button>
</template>