import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
    // Ajouter dans la classe AppComponent
    ngVersion = '16.2.0';
    currentDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
    });
  title = 'GIS Madagascar - Antananarivo';
  backendStatus = 'Non connecté';
  private map: any;
  isLoading = true;

  ngOnInit() {
    this.checkBackendHealth();
  }

  ngAfterViewInit() {
    this.initMap();
  }

  initMap() {
    // Initialiser la carte
    this.map = L.map('map').setView([-18.8792, 47.5079], 13);
    
    // Ajouter la couche de tuiles du tileserver
    L.tileLayer('http://localhost:8081/styles/basic-preview/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors | Carte Antananarivo',
      maxZoom: 18,
      minZoom: 10,
      tileSize: 256
    }).addTo(this.map);

    // Ajouter un marqueur
    const marker = L.marker([-18.8792, 47.5079])
      .addTo(this.map)
      .bindPopup(`
        <div style="text-align: center;">
          <strong>Antananarivo</strong><br>
          <small>Capitale de Madagascar</small><br>
          <small>Population: ~1.3 million</small>
        </div>
      `)
      .openPopup();

    // Ajouter un cercle pour la zone centrale
    L.circle([-18.8792, 47.5079], {
      color: '#3498db',
      fillColor: '#2980b9',
      fillOpacity: 0.1,
      radius: 1500
    }).addTo(this.map)
      .bindPopup('Zone centrale d\'Antananarivo');

    // Ajouter des contrôles
    L.control.scale().addTo(this.map);
    
    this.isLoading = false;
  }

  checkBackendHealth() {
    fetch('http://backend:8080/api/health')
      .then(response => {
        if (response.ok) return response.text();
        throw new Error('Network response was not ok');
      })
      .then(data => {
        this.backendStatus = `✅ Connecté: ${data}`;
        console.log('Backend response:', data);
      })
      .catch(error => {
        this.backendStatus = '❌ Erreur de connexion';
        console.error('Backend error:', error);
      });
  }

  fetchData() {
    fetch('http://backend:8080/api/data')
      .then(response => response.json())
      .then(data => {
        alert(`Données du backend:\n${JSON.stringify(data, null, 2)}`);
      })
      .catch(error => {
        alert('Erreur lors de la récupération des données');
        console.error('Fetch error:', error);
      });
  }

  getMapInfo() {
    fetch('http://backend:8080/api/map-info')
      .then(response => response.json())
      .then(data => {
        alert(`Informations de la carte:\nVille: ${data.city}\nBBox: ${data.bbox}`);
      })
      .catch(error => {
        alert('Erreur lors de la récupération des infos de la carte');
      });
  }

  zoomIn() {
    if (this.map) this.map.zoomIn();
  }

  zoomOut() {
    if (this.map) this.map.zoomOut();
  }

  resetView() {
    if (this.map) this.map.setView([-18.8792, 47.5079], 13);
  }
}