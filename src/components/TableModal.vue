<template>
  <div
    class="fixed inset-0 z-50 grid place-content-center bg-black/50 p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modalTitle"
    v-show="props.isTable"
    @click="handleIsTableClick"
  >
    <div class="w-full rounded-lg bg-white p-6 shadow-lg">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y-2 divide-gray-200">
          <thead class="ltr:text-left rtl:text-right">
            <tr class="*:font-medium *:text-gray-900">
              <th class="px-3 py-2 whitespace-nowrap">Name</th>
              <th class="px-3 py-2 whitespace-nowrap">DoB</th>
              <th class="px-3 py-2 whitespace-nowrap">Role</th>
              <th class="px-3 py-2 whitespace-nowrap">Salary</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-200">
            <tr class="*:text-gray-900 *:first:font-medium">
              <td class="px-3 py-2 whitespace-nowrap">Nandor the Relentless</td>
              <td class="px-3 py-2 whitespace-nowrap">04/06/1262</td>
              <td class="px-3 py-2 whitespace-nowrap">Vampire Warrior</td>
              <td class="px-3 py-2 whitespace-nowrap">$0</td>
            </tr>

            <tr class="*:text-gray-900 *:first:font-medium">
              <td class="px-3 py-2 whitespace-nowrap">Laszlo Cravensworth</td>
              <td class="px-3 py-2 whitespace-nowrap">19/10/1678</td>
              <td class="px-3 py-2 whitespace-nowrap">Vampire Gentleman</td>
              <td class="px-3 py-2 whitespace-nowrap">$0</td>
            </tr>

            <tr class="*:text-gray-900 *:first:font-medium">
              <td class="px-3 py-2 whitespace-nowrap">Nadja</td>
              <td class="px-3 py-2 whitespace-nowrap">15/03/1593</td>
              <td class="px-3 py-2 whitespace-nowrap">Vampire Seductress</td>
              <td class="px-3 py-2 whitespace-nowrap">$0</td>
            </tr>

            <tr class="*:text-gray-900 *:first:font-medium">
              <td class="px-3 py-2 whitespace-nowrap">Colin Robinson</td>
              <td class="px-3 py-2 whitespace-nowrap">01/09/1971</td>
              <td class="px-3 py-2 whitespace-nowrap">Energy Vampire</td>
              <td class="px-3 py-2 whitespace-nowrap">$53,000</td>
            </tr>

            <tr class="*:text-gray-900 *:first:font-medium">
              <td class="px-3 py-2 whitespace-nowrap">Guillermo de la Cruz</td>
              <td class="px-3 py-2 whitespace-nowrap">18/11/1991</td>
              <td class="px-3 py-2 whitespace-nowrap">
                Familiar/Vampire Hunter
              </td>
              <td class="px-3 py-2 whitespace-nowrap">$0</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  isTable: Boolean
})
const emit = defineEmits(['update:isTable'])
const handleIsTableClick = () => {
    emit('update:isTable', !props.isTable)
};
</script>

<style lang="" scoped></style>
