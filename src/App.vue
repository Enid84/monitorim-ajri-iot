<template>
  <div id="app">
    <Dashboard />
  </div>
</template>

<script>
import Dashboard from './components/Dashboard.vue'; // Import your new Dashboard component

export default {
  name: 'App',
  components: {
    Dashboard // Register the Dashboard component for use in this template
  }
};
</script>

<style>
/* You can keep or modify the default styles here */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style>