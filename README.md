# MINARAH  
### AI-Powered Flood Prediction & Emergency Routing System

An intelligent disaster-management platform integrating **Machine Learning, Data Science, DSA, and Computer Networks** to provide **early flood prediction, safe evacuation routing, SOS handling, and real-time emergency response** — purpose-built for flood-prone regions of Pakistan.

---

# Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Solution Highlights](#solution-highlights)
- [AI & ML Pipeline](#ai--ml-pipeline)
- [DSA & Routing Intelligence](#dsa--routing-intelligence)
- [Networking Architecture](#networking-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Model Validation](#model-validation)
- [Security](#security)
- [Future Roadmap](#future-roadmap)
- [Team](#team)
- [Supervisors](#supervisors)
- [License](#license)
- [Final Note](#final-note)

---

# Overview

MINARAH (Flood Prediction and Emergency Routing System) is a full-stack intelligent disaster-management platform developed to improve emergency preparedness during floods.

The system predicts flood risks using **Machine Learning models**, provides **safe evacuation routes**, supports **real-time SOS handling**, and ensures secure communication between citizens, rescue teams, and administrators.

It transforms disaster response from **reactive management to proactive prevention**.

---

# Problem Statement

Floods remain one of the most dangerous natural disasters in Pakistan, causing severe damage due to delayed warnings, unsafe evacuation routes, weak rescue coordination, and lack of real-time flood prediction systems.

Traditional systems are reactive rather than predictive.

MINARAH solves this by providing an intelligent, AI-driven early warning and emergency routing system.

---

# Solution Highlights

- ML-based flood prediction with severity classification  
- Real-time alerts using WebSockets  
- Smart evacuation routing using graph algorithms  
- Hospital and shelter detection  
- Priority-based SOS request handling  
- Secure communication using HTTPS + SSL/TLS  
- Async backend with caching optimization  

---

# AI & ML Pipeline

Raw Weather Data → Feature Engineering → Flood Prediction Model → Confidence Analysis → Alert Generation → Safe Route Recommendation

## Machine Learning Model

### Supervised Learning

- Binary Classification → Flood / No Flood  
- Multi-Class Classification → Low / Moderate / Severe Flood  

### Algorithm Used

**Random Forest Classifier**

Chosen because of:

- High prediction accuracy  
- Handles non-linear relationships  
- Reduces overfitting  
- Feature importance analysis  

### Features Used

- Rainfall  
- Temperature  
- NDVI  
- NDSI  
- Month  
- Year  
- Province  

### Data Preprocessing

- Missing value handling  
- Label Encoding  
- StandardScaler normalization  
- Outlier handling using IQR  
- SMOTE-Tomek for class imbalance correction  

### Model Evaluation

- ROC-AUC  
- Precision  
- Recall  
- F1-Score  
- Cohen’s Kappa  
- K-Fold Cross Validation  

Recall is prioritized because missing a flood is more dangerous than false alarms.

---

# DSA & Routing Intelligence

## Graph-Based Routing

Road networks are modeled using graphs:

- Nodes → Locations  
- Edges → Roads  

Each edge includes:

- Distance  
- Travel time  
- Flood risk score  

Flood-affected roads are dynamically blocked.

## Dijkstra’s Algorithm

Used for safest and shortest evacuation path.

The algorithm avoids high-risk flood zones while minimizing travel distance.

## Hash Tables

Used to store:

- Hospitals  
- Shelters  
- Emergency resources  

Provides fast O(1) average lookup.

## Priority Queues

Used for SOS request prioritization.

Critical emergency cases receive faster rescue attention automatically.

---

# Networking Architecture

## Client-Server Model

### Clients

- Citizen Dashboard  
- Rescue Team Module  
- Admin Panel  

### Server

- FastAPI backend  
- ML prediction engine  
- Routing system  
- Database services  

## REST APIs

Communication uses:

### HTTP / HTTPS

Examples:

- GET → Flood prediction requests  
- POST → SOS alerts  
- PUT → Admin updates  

## WebSockets

Used for:

- Live flood alerts  
- Instant SOS notifications  
- Real-time route updates  
- Rescue acknowledgments  

## Security Layer

### SSL / TLS Encryption

Protects:

- User credentials  
- SOS messages  
- Live locations  
- Emergency communication  

Prevents unauthorized access and data interception.

---

# Tech Stack

## Backend

- FastAPI  
- Python  
- Uvicorn  
- Async Programming  

## Frontend

- HTML  
- CSS  
- JavaScript  
- Web Dashboard UI  

## Machine Learning

- Scikit-learn  
- Pandas  
- NumPy  
- Random Forest  

## External APIs

- Open-Meteo API  
- NASA POWER API  
- OpenStreetMap API  
- OpenRouteService API  
- Open-Meteo Geocoding API  

## Performance Optimization

- Parallel API Calls  
- LRU Cache  
- Flood Risk Cache  
- HashMap Caching  
- Async Database Queries  
- Connection Pooling  

Response time improved from **15–30s to 2–5s**

---

# Project Structure

```bash
minarah/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   └── utils/
│
├── frontend/
│   ├── citizen/
│   ├── admin/
│   └── rescue/
│
├── ml/
│   ├── training/
│   ├── prediction/
│   └── preprocessing/
│
├── data/
├── tests/
└── README.md
