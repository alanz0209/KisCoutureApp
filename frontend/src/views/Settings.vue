<template>
  <div class="container">
    <h1>⚙️ Paramètres</h1>

    <div class="settings-grid">
      <!-- Informations de l'application -->
      <div class="card">
        <h2>ℹ️ À propos</h2>
        <p class="card-description">Informations sur l'application</p>

        <div class="app-info">
          <p><strong>Application:</strong> KIS COUTURE</p>
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Développé par:</strong> Alain Narcisse ZONGO</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Settings'
};
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 30px;
  color: #2c3e50;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card h2 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 20px;
}

.card-description {
  color: #7f8c8d;
  font-size: 14px;
  margin-bottom: 20px;
}

.app-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}

.app-info p {
  margin: 8px 0;
  font-size: 14px;
  color: #555;
}

@media (max-width: 768px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}
</style>
