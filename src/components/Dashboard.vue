<template>
  <div class="dashboard">
    <header class="thesis-header">
      <h1>MONITORIMI I CILËSISË SË AJRIT</h1>
      <h1>DHE PARAQITJA E TË DHËNAVE PËRMES IOT</h1>
      <p class="author-name">Enid Muharemi</p>
    </header>

    <div v-if="loading" class="loading-message">
      Duke ngarkuar te dhenat...
    </div>

    <div v-if="error" class="error-message">
      Gabim: {{ error }}
    </div>

    <div v-if="latestReadings" class="metrics-container">
      <div class="metric-box" :style="temperatureGradient">
        <div class="metric-icon">🌡️</div> <p class="metric-label">Temperatura</p>
        <p class="metric-value">{{ latestReadings.temperatura }} °C</p>
      </div>

      <div class="metric-box" :style="humidityGradient">
        <div class="metric-icon">💧</div> <p class="metric-label">Lagështia</p>
        <p class="metric-value">{{ latestReadings.lageshtia }} %</p>
      </div>

      <div class="metric-box" :style="gasColor">
        <div class="metric-icon">💨</div> <p class="metric-label">Përqendrimi i Gazit</p>
        <p class="metric-value">{{ latestReadings.gazi_bruto }}</p>
        <p class="gas-status-text">Gazi: {{ latestReadings.gaz_zbuluar ? 'Zbuluar' : 'Normal' }}</p>
      </div>
    </div>

    <div class="sensor-logs card">
      <h2>Historiku i Sensoreve (100 Leximet e Fundit)</h2>
      <ul v-if="sensorLogs.length" class="log-list">
        <li v-for="(log, index) in sensorLogs" :key="index" class="log-item">
          <div class="log-item-header">
            <span class="log-timestamp">{{ log.timestamp_string }}</span>
            <span :class="['gas-status', { 'gas-detected': log.gaz_zbuluar }]">
              Gazi: {{ log.gaz_zbuluar ? 'Zbuluar' : 'Normal' }}
            </span>
          </div>
          <div class="log-item-details">
            <span>Temp: {{ log.temperatura }}°C</span>
            <span>Lag: {{ log.lageshtia }}%</span>
            <span>Bruto: {{ log.gazi_bruto }}</span>
          </div>
        </li>
      </ul>
      <p v-else class="no-data-message">Nuk ka historik te te dhenave.</p>
    </div>

    </div>
</template>

<script>
import { auth, database, ref, onValue, signInWithEmailAndPassword, query, orderByChild, limitToLast } from '@/firebaseConfig';

export default {
  name: 'AirQualityDashboard',
  data() {
    return {
      user: null,
      loading: true,
      error: null,
      latestReadings: null,
      sensorLogs: []
    };
  },
  computed: {
    // Dynamic gradient for Temperature
    temperatureGradient() {
      if (!this.latestReadings) return {};
      const temp = this.latestReadings.temperatura;
      let color1, color2;

      // Define temperature ranges and corresponding colors
      if (temp <= 10) { // Cold (e.g., < 10°C)
        color1 = '#81D4FA'; // Light Blue
        color2 = '#2196F3'; // Blue
      } else if (temp <= 25) { // Optimal/Good (e.g., 10-25°C)
        color1 = '#C8E6C9'; // Light Green
        color2 = '#4CAF50'; // Green
      } else if (temp <= 30) { // Warm (e.g., 25-30°C)
        color1 = '#FFECB3'; // Light Yellow
        color2 = '#FFCA28'; // Amber
      } else { // Hot (e.g., > 30°C)
        color1 = '#FFCDD2'; // Light Red
        color2 = '#F44336'; // Red
      }
      return {
        background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`
      };
    },

    // Dynamic gradient for Humidity
    humidityGradient() {
      if (!this.latestReadings) return {};
      const humidity = this.latestReadings.lageshtia;
      let color1, color2;

      // Define humidity ranges and corresponding colors
      if (humidity < 30) { // Too Dry (e.g., < 30%)
        color1 = '#FFCC80'; // Light Orange
        color2 = '#FB8C00'; // Orange
      } else if (humidity <= 60) { // Optimal (e.g., 30-60%)
        color1 = '#A7FFEB'; // Light Cyan
        color2 = '#00BCD4'; // Cyan
      } else { // Too Humid (e.g., > 60%)
        color1 = '#E1BEE7'; // Light Purple
        color2 = '#9C27B0'; // Purple
      }
      return {
        background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`
      };
    },

    // Dynamic background color for Gas
    gasColor() {
      if (!this.latestReadings) return {};
      const gasDetected = this.latestReadings.gaz_zbuluar;
      const gasBruto = this.latestReadings.gazi_bruto; // Assuming higher value = more gas

      let color;
      if (gasDetected) { // Gas detected is priority
        color = '#F44336'; // Red - Dangerous
      } else if (gasBruto > 250) { // Example threshold for 'Careful' (Adjust this based on your sensor's values)
        color = '#FFC107'; // Yellow - Careful
      } else {
        color = '#4CAF50'; // Green - Good
      }
      return {
        backgroundColor: color // Solid background color
      };
    }
  },
  async created() {
    try {
      // IMPORTANT: Replace 'nautikaandi@gmail.com' and 'Enid98diploma35@6'
      // with your actual Firebase Authentication user credentials.
      const userCredential = await signInWithEmailAndPassword(auth, 'nautikaandi@gmail.com', 'Enid98diploma35@6');
      this.user = userCredential.user;
      console.log('Firebase user logged in:', this.user.email);

      this.fetchLatestReadings();
      this.fetchSensorLogs();

    } catch (error) {
      console.error('Firebase Authentication Error:', error);
      this.error = 'Gabim autentifikimi: ' + error.message;
      this.loading = false;
    }
  },
  methods: {
    fetchLatestReadings() {
      const latestReadingsRef = ref(database, 'latestReadings');
      onValue(latestReadingsRef, (snapshot) => {
        if (snapshot.exists()) {
          this.latestReadings = snapshot.val();
          console.log('Latest Readings:', this.latestReadings);
        } else {
          console.log('No latest readings data available.');
          this.latestReadings = null;
        }
        this.loading = false;
      }, (error) => {
        console.error('Error fetching latest readings:', error);
        this.error = 'Gabim ne leximin e te dhenave aktuale: ' + error.message;
        this.loading = false;
      });
    },

    fetchSensorLogs() {
      const sensorLogsQuery = query(
        ref(database, 'sensor_logs'),
        orderByChild('timestamp'),
        limitToLast(100)
      );

      onValue(sensorLogsQuery, (snapshot) => {
        const logs = [];
        snapshot.forEach((childSnapshot) => {
          logs.push(childSnapshot.val());
        });

        this.sensorLogs = logs.sort((a, b) => a.timestamp - b.timestamp).reverse();
        console.log('Sensor Logs:', this.sensorLogs.length, 'entries');
      }, (error) => {
        console.error('Error fetching sensor logs:', error);
        this.error = 'Gabim ne leximin e historikut te te dhenave: ' + error.message;
      });
    }
  }
};
</script>

<style scoped>
/* Base Styles */
.dashboard {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 20px;
  max-width: 1200px; /* Slightly wider max-width for more space */
  margin: 20px auto;
  background-color: #f0f2f5; /* Light gray background */
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  color: #333;
  overflow-x: hidden; /* Prevent horizontal scroll on small screens */
}

/* Thesis Header */
.thesis-header {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 3px solid #e0e0e0;
}

.thesis-header h1 {
  font-size: 2.5em; /* Larger title */
  color: #2c3e50;
  margin: 0;
  line-height: 1.2;
  font-weight: 700;
  text-transform: uppercase;
}

.thesis-header .author-name {
  font-size: 0.9em; /* Small name */
  color: #616161;
  margin-top: 10px;
  font-weight: 400;
  letter-spacing: 0.05em;
}

h2 {
  font-size: 1.6em;
  color: #3f51b5; /* A pleasant blue for section headers */
  text-align: center;
  margin-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 10px;
}

/* Messages (Loading, Error, No Data) */
.loading-message, .error-message, .no-data-message {
  text-align: center;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: bold;
}

.loading-message {
  background-color: #e3f2fd; /* Light blue */
  color: #1976d2; /* Darker blue */
}

.error-message {
  background-color: #ffebee; /* Light red */
  color: #d32f2f; /* Darker red */
  border: 1px solid #ef9a9a;
}

.no-data-message {
  color: #616161;
  font-style: italic;
  padding: 10px;
}

/* Metrics Container (Three Boxes) */
.metrics-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); /* Adjusted minwidth for 25-30% */
  gap: 25px;
  margin-bottom: 40px;
  justify-content: center; /* Center boxes if not filling all space */
}

.metric-box {
  background-color: #ffffff; /* Fallback */
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  /* Flexbox for vertical alignment */
  display: flex;
  flex-direction: column;
  justify-content: center; /* Vertically center content */
  align-items: center;   /* Horizontally center content */
  min-height: 180px; /* Ensure consistent height */

  color: #fff; /* Text color for gradients */
  text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
}

.metric-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.metric-icon {
  font-size: 3.5em; /* Large icon placeholder */
  margin-bottom: 10px; /* Consistent gap below the icon */
  line-height: 1; /* Remove extra space around emoji */
}

.metric-label {
  font-size: 1.1em;
  font-weight: 500;
  margin-top: 0; /* Remove default top margin */
  margin-bottom: 5px; /* Add a small gap below the label */
  text-transform: uppercase;
}

.metric-value {
  font-size: 2.8em; /* Much larger value */
  font-weight: 700;
  margin: 0; /* Remove default margins on top/bottom */
  line-height: 1.2;
}

.gas-status-text {
  font-size: 1em;
  font-weight: 600;
  margin-top: 5px; /* Add a small gap above this text */
  margin-bottom: 0; /* Remove default margin on bottom */
}

/* Card Styling (re-used for historical data) */
.card {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

/* Sensor Logs List */
.sensor-logs .log-list {
  list-style-type: none;
  padding: 0;
  max-height: 450px; /* Increased height for more logs */
  overflow-y: auto; /* Scroll for many logs */
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background-color: #fafafa;
}

.log-item {
  background-color: #ffffff;
  padding: 15px 20px;
  margin-bottom: 8px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.log-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.log-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-weight: 600;
  color: #424242;
}

.log-timestamp {
  font-size: 0.9em;
  color: #757575;
}

.gas-status {
  padding: 4px 8px;
  border-radius: 5px;
  font-size: 0.85em;
  font-weight: bold;
  color: #fff;
  background-color: #4caf50; /* Green for Normal */
}

.gas-status.gas-detected {
  background-color: #f44336; /* Red for Detected */
}

.log-item-details {
  display: flex;
  flex-wrap: wrap; /* Allows items to wrap on smaller screens */
  gap: 15px; /* Spacing between details */
  font-size: 0.95em;
  color: #555;
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .metrics-container {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* Adjust for slightly smaller screens */
  }
  .thesis-header h1 {
    font-size: 2.2em;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 15px;
    margin: 15px auto;
  }

  .thesis-header h1 {
    font-size: 1.8em;
  }

  h2 {
    font-size: 1.4em;
  }

  .metrics-container {
    grid-template-columns: 1fr; /* Stack boxes on small screens */
  }
}

@media (max-width: 480px) {
  .dashboard {
    padding: 10px;
    margin: 10px auto;
  }

  .thesis-header h1 {
    font-size: 1.4em;
  }
  
  .metric-box, .card {
    padding: 15px;
  }

  .metric-icon {
    font-size: 2.8em;
  }

  .metric-value {
    font-size: 2.2em;
  }
}
</style>