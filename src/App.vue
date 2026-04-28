<script setup>
import { ref } from 'vue'

const donations = ref([
  { id: 1, title: "Help Children Education", amount: 1200 },
  { id: 2, title: "Medical Support Fund", amount: 850 },
  { id: 3, title: "Food for Seniors", amount: 430 }
])

const newDonation = ref("")
</script>

<template>
  <div class="container">

    <!-- Header -->
    <header class="header">
      <h1>Donation Platform</h1>
      <nav>
        <a href="#">Home</a>
        <a href="#">Campaigns</a>
        <a href="#">My Donations</a>
      </nav>
    </header>

    <!-- Hero -->
    <section class="hero">
      <h2>Make a Difference Today</h2>
      <p>Your small help can change lives</p>
    </section>

    <!-- Add Campaign -->
    <section class="create">
      <h3>Create Campaign</h3>
      <input v-model="newDonation" placeholder="Campaign Title" />
      <button @click="addDonation">Add</button>
    </section>

    <!-- Campaign List -->
    <section class="campaigns">
      <h3>Active Campaigns</h3>

      <div 
        class="card" 
        v-for="item in donations" 
        :key="item.id"
      >
        <h4>{{ item.title }}</h4>
        <p>Raised: ${{ item.amount }}</p>
        <button @click="donate(item)">Donate</button>
      </div>

    </section>

    <!-- Footer -->
    <footer class="footer">
      <p>© 2026 Donation Platform</p>
    </footer>

  </div>
</template>

<script>
export default {
  methods: {
    addDonation() {
      if (!this.newDonation) return
      this.donations.push({
        id: Date.now(),
        title: this.newDonation,
        amount: 0
      })
      this.newDonation = ""
    },
    donate(item) {
      item.amount += 10
    }
  }
}
</script>

<style>
.container {
  font-family: Arial;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  padding: 20px;
  background: #2c3e50;
  color: white;
}

.header a {
  margin: 0 10px;
  color: white;
  text-decoration: none;
}

/* Hero */
.hero {
  text-align: center;
  padding: 50px;
  background: #ecf0f1;
}

/* Create */
.create {
  padding: 20px;
  text-align: center;
}

.create input {
  padding: 8px;
  margin-right: 10px;
}

/* Campaigns */
.campaigns {
  padding: 20px;
}

.card {
  background: white;
  padding: 15px;
  margin: 10px 0;
  border-radius: 8px;
}

button {
  padding: 8px 12px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

/* Footer */
.footer {
  text-align: center;
  padding: 20px;
  background: #2c3e50;
  color: white;
}
</style>