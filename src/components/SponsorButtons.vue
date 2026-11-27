<script setup lang="ts">
import { computed } from 'vue'
import { siteLang } from '~/logics'

const copy = computed(() => {
  if (siteLang.value === 'vi') {
    return {
      intro: 'Nếu các dự án mã nguồn mở hoặc bài viết kỹ thuật này hữu ích cho bạn và đội ngũ, rất mong được đồng hành tài trợ cho hệ sinh thái hoặc trao đổi cơ hội hợp tác. Cảm ơn bạn!',
      ecosystem: 'Tài trợ hệ sinh thái',
      howItWorks: 'Cách thức hoạt động',
      personal: 'Đồng hành cùng Tu Quet',
    }
  }
  return {
    intro: 'If my open-source work or engineering articles help your team, consider sponsoring the ecosystem or reaching out to collaborate. Thank you!',
    ecosystem: 'Sponsor the Ecosystem',
    howItWorks: 'How does this work?',
    personal: 'Sponsor to support Tu Quet',
  }
})
</script>

<template>
  <div>
    <p>{{ copy.intro }}</p>

    <div flex="~ gap-2 wrap items-center" class="my-4">
      <a
        href="https://github.com/sponsors/tuquet"
        target="_blank"
        rel="noopener noreferrer"
        class="group btn-rose text-base p2 px3 pr2"
      >
        <span
          i-ph-hand-heart-duotone
          group-hover="i-ph-hand-heart-fill text-rose"
          transition-all duration-200 ease-out
          class="inline-block mr-1"
        />
        {{ copy.ecosystem }}
      </a>
      <span op50 text-sm>
        <a href="https://github.com/sponsors/tuquet" target="_blank" rel="noopener noreferrer">{{ copy.howItWorks }}</a>
      </span>
    </div>

    <div flex="~ gap-2 wrap" class="my-4">
      <a
        href="https://github.com/sponsors/tuquet"
        target="_blank"
        rel="noopener noreferrer"
        class="group btn-rose inline-block"
      >
        <span
          i-ph-heart-duotone
          group-hover="i-ph-heart-fill text-rose"
          transition-all duration-200 ease-out
          class="inline-block mr-1"
        />
        {{ copy.personal }}
      </a>
    </div>
  </div>
</template>
