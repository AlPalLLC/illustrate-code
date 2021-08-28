<template>
  <main class="h-screen w-screen flex items-center justify-center p-10">
    <div 
      class="
        h-full w-full max-w-6
        flex flex-col gap-5 p-6
        bg-gray-90 rounded-5 overflow-scroll
      "
    >
      <div
        v-for="({ indentationWidth, tokens }, index) in lines"
        class="flex items-center"
      >
        <div
          class="relative"
          :style="{
            width: `${indentationWidth}%`,
          }"
        ></div>
        <div
          class="relative w-full flex items-center overflow-hidden"
          :style="{ gap: `${TOKEN_GAP}%` }"
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
          ></div>
          <div
            class="absolute top-0 left-0 h-full w-full bg-gray-90 rounded-full transition ease-in-out"
            :class="[
              codeStatus === 'typed' ? 'translate-x-full' : 'translate-x-0',
            ]"
            :style="{
              transitionDuration: `${TYPING_TRANSITION_DURATION}ms`,
              transitionDelay: `${TYPING_TRANSITION_DURATION * .5 * index}ms`,
            }"
          ></div>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { createClamp } from '@baleada/logic'
import { useDelayable } from '@baleada/vue-composition'

const TOKEN_GAP = 3,
      BASE_INDENTATION_WIDTH = 5,
      MAX_TOKEN_WIDTH = 60,
      MIN_TOKEN_WIDTH = 5,
      TYPING_TRANSITION_DURATION = 500

export default defineComponent({
  setup () {
    const lines = ref(toLines(10)),
          codeStatus = ref('not typed')

    const type = useDelayable(() => codeStatus.value = 'typed', { delay: 200 })

    onMounted(() => type.value.delay())

    return {
      lines,
      toBg,
      TOKEN_GAP,
      TYPING_TRANSITION_DURATION,
      codeStatus,
    }
  }
})

type Line = {
  indentationWidth: number,
  tokens: Token[],
}

function toLines (n: number): Line[] {
  const lines: Line[] = []

  for (let i = 0; i < n; i++) {
    const indentation = (() => {
            if (i === 0) {
              return 0
            }

            if (i === n - 1) {
              return 0
            }

            // Maintain indentation after empty line
            if (i >= 3) {
              if (lines[i - 1].tokens[0].type === 0) {
                const previousNonEmptyIndentation = lines[i - 2].indentationWidth
                return previousNonEmptyIndentation / BASE_INDENTATION_WIDTH
              }
            }

            const previousIndentation = lines[i - 1].indentationWidth / BASE_INDENTATION_WIDTH

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
              { outcome: 'none', probability: .10 },
              { outcome: 'in', probability: .55 },
              { outcome: 'out', probability: .35 },
            ])

            if (outcome === 'none') {
              return previousIndentation
            } else if (outcome === 'in') {
              return previousIndentation + 1
            } else if (outcome === 'out') {
              return previousIndentation - 1
            }
          })(),
          indentationWidth = indentation * BASE_INDENTATION_WIDTH,
          tokens: Token[] = [],
          probabilityOfEmptyLine = (() => {
            // Always have code on first and last line
            if (i === 0 || i === n - 1) {
              return 0
            }

            const previousLineType = lines[i - 1].tokens[0].type === 0 ? 'empty' : 'code'
            return previousLineType === 'empty' ? 0 : .15
          })(),
          lineType = toOutcome([
            { outcome: 'empty', probability: probabilityOfEmptyLine },
            { outcome: 'code', probability: 1 - probabilityOfEmptyLine }
          ]),
          totalTokens = lineType === 'empty' ? 0 : Math.ceil(Math.random() * 6),
          widths = new Array(totalTokens)
            .fill(0)
            .reduce(reduced => {
              const width = reduced.remainingWidth >= 5
                ? createClamp({
                    min: MIN_TOKEN_WIDTH,
                    max: reduced.remainingWidth
                  })(Math.floor(MAX_TOKEN_WIDTH * Math.random()))
                : 0

              reduced.widths.push(width)

              return {
                widths: reduced.widths,
                remainingWidth: Math.max(reduced.remainingWidth - width, 0),
              }
            }, { widths: [], remainingWidth: 100 - ((totalTokens - 1) * TOKEN_GAP) }).widths

    if (totalTokens === 0) {
      tokens.push({ type: 0, width: 100 })
    }
    
    for (let j = 0; j < totalTokens; j++) {
      const type = Math.ceil(Math.random() * 5),
            width = widths[j]

      tokens.push({ type, width })
    }

    lines.push({ indentationWidth, tokens })
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
    case 0:
      return 'bg-gray-90'
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
