<template>
  <div></div>
</template>

<script>
const customTitlebar = require('custom-electron-titlebar')
/* eslint-disable */
export default {
  mounted () {
    const titlebar = new customTitlebar.Titlebar({
      backgroundColor: customTitlebar.Color.fromHex('#000'),
      menu: false,
      titleHorizontalAlignment: 'left',
    })

    titlebar.updateTitle('Lysosome Music');
  }
}
</script>
