<template>
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full select-none">
    <title>Tu Quet (tq)</title>
    <path
      class="path1"
      d="M 16 40 C 24 40, 34 38, 44 34 C 50 31, 44 14, 34 11 C 27 11, 29 36, 28 58 C 28 66, 36 66, 44 48 C 48 38, 54 33, 62 33 C 50 34, 45 49, 53 58 C 60 60, 66 48, 66 36 C 66 54, 65 72, 63 86 C 63 94, 75 92, 79 79 C 82 66, 86 52, 91 38"
      stroke="black"
      stroke-width="2.3"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<style scoped>
@media (prefers-reduced-motion) {
  .path1 {
    animation: none !important;
    stroke-dasharray: unset !important;
  }
}
@media print {
  .path1 {
    animation: none !important;
    stroke-dasharray: unset !important;
  }
}

@keyframes grow {
  0% {
    stroke-dashoffset: 1px;
    stroke-dasharray: 0 350px;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  40% {
    stroke-dasharray: 350px 0;
  }
  85% {
    stroke-dasharray: 350px 0;
  }
  95%,
  to {
    stroke-dasharray: 0 350px;
  }
}

.path1 {
  stroke-dashoffset: 1px;
  stroke-dasharray: 350px 0;
  animation: grow 10s ease forwards infinite;
  transform-origin: center;
  stroke: #303030;
  animation-delay: 0s;
}

.dark .path1 {
  stroke: #fdfdfd;
}
</style>
