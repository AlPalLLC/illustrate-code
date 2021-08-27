<template>
  <main class="h-screen w-screen flex items-center justify-center p-10">
    <div 
      class="
        h-full w-full max-w-6
        flex flex-col gap-6 p-8
        bg-gray-900 rounded-5 overflow-scroll
      "
    >
      <div
        v-for="{ indentation, tokens } in lines"
        class="flex items-center gap-4"
        :style="{
          paddingLeft: `${indentation * 2}rem`,
        }"
      >
        <div
          v-for="{ type, width } in tokens"
          class="flex-shrink-0 h-5 rounded-full"
          :class="[
            toBg(type)
          ]"
          :style="{
            width: `${width}%`,
          }"
        />
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  setup () {
    const lines = ref(toLines(7))

    console.log(lines.value)

    return {
      lines,
      toBg,
    }
  }
})

type Line = {
  indentation: number,
  tokens: Token[],
}

function toLines (n: number): Line[] {
  const lines: Line[] = []

  for (let i = 0; i < n; i++) {
    const indentation = (() => {
            if (i === 0) {
              return 0
            }

            if (i === n) {
              return 0
            }

            const previousIndentation = lines[i - 1].indentation

            // Transition to reach 0 at the last line
            if (n - i - previousIndentation === 0) {
              return previousIndentation - 1
            } else if (n - i - previousIndentation < 0) {
              return previousIndentation - 1 + (n - i - previousIndentation)
            }

            // Never outdent without indentation
            if (previousIndentation === 0) {
              const outcome = toOutcome([
                { outcome: 'none', probability: .5 },
                { outcome: 'in', probability: .5 },
              ])

              if (outcome === 'none') {
                return previousIndentation
              } else if (outcome === 'in') {
                return previousIndentation + 1
              }
            }

            // Otherwise, pick one
            const outcome = toOutcome([
              { outcome: 'none', probability: .1 },
              { outcome: 'in', probability: .55 },
              { outcome: 'out', probability: .55 },
            ])

            if (outcome === 'none') {
              return previousIndentation
            } else if (outcome === 'in') {
              return previousIndentation + 1
            } else if (outcome === 'out') {
              return previousIndentation - 1
            }
          })(),
          tokens: Token[] = [],
          totalTokens = Math.ceil(Math.random() * 6),
          widths = new Array(totalTokens).fill(0).reduce(({ widths, remainingWidth }) => {
            const width = Math.floor(remainingWidth * Math.random())

            return {
              widths: [...widths, width],
              remainingWidth: remainingWidth - width,
            }
          }, { widths: [], remainingWidth: 100 }).widths
    
    for (let j = 0; j < totalTokens; j++) {
      const type = Math.ceil(Math.random() * 5),
            width = widths[j]

      tokens.push({ type, width })
    }

    lines.push({ indentation, tokens })
  }

  return lines
}

type Token = {
  type: number
  width: number,
}

function toOutcome (possibilities: { outcome: string, probability: number }[]): string {
  const chance = Math.random(),
        withFromChance = possibilities.map(({ outcome, probability }, index) => {
          const lowerBound = index === 0 ? 0 : possibilities.slice(0, index).reduce((lowerBound, { probability }) => lowerBound + probability, 0),
                upperBound = lowerBound + probability

          return {
            outcome,
            fromChance: chance => chance >= lowerBound && chance < upperBound,
          }
        })

  return withFromChance.find(({ fromChance }) => fromChance(chance)).outcome
}

function toBg (type: Token['type']): `bg-${string}-${number}` {
  switch (type) {
    case 1:
      return 'bg-orange-60'
    case 2:
      return 'bg-amber-40'
    case 3:
      return 'bg-blue-50'
    case 4:
      return 'bg-purple-50'
    case 5:
      return 'bg-green-60'
  }
}
</script>
