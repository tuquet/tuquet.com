<template>
  <svg viewBox="-12 -6.88 90 90" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full select-none logo-tq">
    <title>Tu Quet (tq)</title>
    <path
      class="path1"
      d="M-3 19C7.5 22 21.5 22.5 32 17.5C13.5 36.5 22 1 15.5 0.5C12 0.5 14 24.5 14 44.5C15 53.5 22.0714 44.5 26 39C31 32 38.5 30 44 29C38.5 22 26 30 27 41C28 49 40 48 47 28C44 41 46 57.5 42.5 73C40.5 81.5 45 70 50 57C53.5 47.5 41 54 50 44.5C57.5 38.5 63.5 33.5 69 31"
      stroke="currentColor"
      stroke-width="1"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<style scoped>
.logo-tq {
  color: #303030;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.logo-tq:hover {
  transform: scale(1.08);
}

.dark .logo-tq {
  color: #fdfdfd;
}

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
