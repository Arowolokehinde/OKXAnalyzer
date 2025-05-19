#  OKC Token Launch Analytics Dashboard

A powerful analytics platform designed for discovering and evaluating new token launches on the **OKX Chain (OKC)**. This dashboard aggregates real-time data from OKX DEX APIs to help DeFi traders, meme coin hunters, and analytics builders spot opportunities early and make informed trading decisions.

**Theme:** DeFi · Trading
**Contributors:** Kenny & Henry

---

## 📖 Table of Contents

* [📌 Project Overview](#-project-overview)
* [🎯 Goals & Objectives](#-goals--objectives)
* [🧩 Features](#-features)
* [📡 APIs & Integrations](#-apis--integrations)
* [🧑‍💻 User Flow](#-user-flow)
* [🧠 User Personas](#-user-personas)
* [💻 Tech Stack](#-tech-stack)
* [📈 Key Metrics (KPIs)](#-key-metrics-kpis)
* [🧪 Future Extensions](#-future-extensions)
* [🛠️ Setup & Development](#️-setup--development)
* [📂 Project Structure](#-project-structure)
* [📝 License](#-license)

---

## 📌 Project Overview

**OKC Token Launch Analytics Dashboard** is a web-based platform that helps users track new token launches, trending meme coins, and key market data in real-time on the OKX Chain (OKC). It provides tools for filtering, comparing, and simulating token swaps using integrated DEX APIs.

---

## 🎯 Goals & Objectives

* Track and display **newly launched tokens** on OKC with real-time metrics.
* Highlight **trending meme coins** using OKX data and virality metrics.
* Enable informed decision-making via interactive **charts, filters, and comparisons**.
* Provide **alerts** and **watchlist functionality** for early movers.
* Offer developer access via **exportable API data**.

---

## 🧩 Features

| Feature                  | Description                                                  |
| ------------------------ | ------------------------------------------------------------ |
| **Token Discovery Feed** | Real-time list of new token launches with key metrics        |
| **Trending Meme Coins**  | Trending tokens ranked by volume, virality, and price action |
| **Token Detail Pages**   | Charts, liquidity stats, holders, swap activity              |
| **Filter & Sort**        | Filter tokens by age, liquidity, volume, holders, etc.       |
| **Alerts**               | Set custom alerts for price, volume, or liquidity changes    |
| **Token Compare Tool**   | Compare multiple tokens side-by-side                         |
| **Swap Recommendation**  | AI-assisted suggestions based on volume and volatility       |
| **Watchlist**            | Track favorite tokens and get real-time updates              |
| **API Export**           | Export filtered token analytics (CSV, JSON)                  |

---

## 📡 APIs & Integrations

| API Source                            | Usage                                                       |
| ------------------------------------- | ----------------------------------------------------------- |
| `OKX Market Data API`                 | Real-time token metrics (volume, liquidity, price, holders) |
| `OKX Swap API`                        | Swap simulation and trade tracking                          |
| `web3.okx.com`                        | Trending meme coin data (price pumps, virality)             |
| *(Optional)* Twitter / Telegram Feeds | Future integration for social sentiment analysis            |

---

## 🧑‍💻 User Flow

### 👤 New Users

1. Land on Dashboard → See newly launched tokens.
2. Click on "Trending Memes" → Explore meme coin gainers.
3. Apply filters: Launch Time + Volume + Liquidity.
4. View token detail → Add to watchlist or simulate swap.
5. Set alerts for price/volume movement.

### 🔥 Power Users

1. Use **Compare Tool** to analyze multiple tokens.
2. Set **custom alerts** for high-volume tokens.
3. Export data via API for use in custom dashboards or bots.

---

## 🧠 User Personas

| Persona                | Description                                          |
| ---------------------- | ---------------------------------------------------- |
| **DeFi Traders**       | Active traders seeking alpha on new listings         |
| **Meme Coin Hunters**  | Viral token speculators watching pump signals        |
| **Token Snipers**      | Whales/bots hunting high-liquidity launches          |
| **Analytics Builders** | Developers building tools/dashboards from token data |

---

## 💻 Tech Stack

| Layer          | Technology                            |
| -------------- | ------------------------------------- |
| **Frontend**   | React, Tailwind CSS                   |
| **Backend**    | Node.js, Express                      |
| **Database**   | PostgreSQL or MongoDB                 |
| **Infra**      | AWS / GCP / Vercel                    |
| **Blockchain** | OKX DEX APIs (Market Data & Swap API) |

---

## 📈 Key Metrics (KPIs)

* 📊 New tokens tracked per day
* ⏱️ Avg user session time
* 🔄 Conversion rate (watchlist/swap)
* 📥 API export usage
* 🔔 Alert click-through rate

---

## 🧪 Future Extensions

* AI-based **social sentiment analysis** (X, Telegram, Discord)
* On-chain creator analysis for **scam detection**
* Cross-chain token analytics (e.g., Base, BNB, Arbitrum)
* Community leaderboards: Most-watched, Top gainers

---

## 🛠️ Setup & Development

### Prerequisites

* Node.js v18+
* npm or yarn
* MongoDB or PostgreSQL running locally or in the cloud

### Installation

```bash
git clone https://github.com/your-org/okc-token-dashboard.git
cd okc-token-dashboard
npm install
```

### Development

```bash
# Start frontend and backend together
npm run dev
```

### Environment Variables (`.env`)

```env
OKX_API_KEY=your_key
OKX_API_SECRET=your_secret
MONGO_URI=mongodb://localhost:27017/okc-dashboard
PORT=3000
```

---

## 📂 Project Structure

```
/src
├── /api            # API integration layer (OKX Market/Swap APIs)
├── /components     # Reusable UI components
├── /pages          # Route-based views (Dashboard, Trending, TokenDetail, etc.)
├── /utils          # Filter logic, helpers, mock data
├── /hooks          # Custom React hooks for data fetching
├── /config         # Environment and constants
/backend
├── /routes         # Express API routes
├── /controllers    # Token + user logic
├── /models         # MongoDB/PostgreSQL schemas
```

---


## Core Modules

### Token Discovery Module
- Detects new token launches on OKC
- Filters based on minimum volume, liquidity, etc.
- Sorts tokens by various metrics

### Trending Meme Coin Scraper
- Identifies trending meme coins from OKX DEX
- Scrapes web data when API is unavailable
- Filters for high-potential meme tokens

### Token Metrics Module
- Calculates detailed metrics for tokens
- Processes swap history and holder data
- Derives volatility and growth metrics

### Token Comparison Module
- Compares multiple tokens side-by-side
- Calculates composite scores based on weighted metrics
- Generates comparison reports

### Swap Recommender Module
- Analyzes token metrics for trading opportunities
- Generates recommendations with explanations
- Considers multiple factors like volume/liquidity ratio, price action, volatility

### Token Filter Module
- Applies custom filtering criteria
- Sorts results by user-defined metrics
- Provides filtering summaries

### Data Export Module
- Exports data in JSON and CSV formats
- Supports exporting multiple data types
- Generates comprehensive reports

## Configuration

Configuration is managed through the `config.js` file and environment variables in `.env`. Key configuration options:

- **API URLs**: Endpoints for OKX DEX API
- **Filters**: Default filters for token discovery
- **Feature Flags**: Toggle features like caching, real API data, etc.
- **Output Paths**: File paths for data storage

## Data Flow

1. **Data Collection**: Token discovery and meme coin scraper collect raw token data
2. **Data Processing**: Metrics module calculates detailed metrics for each token
3. **Analysis**: Comparison and recommendation modules analyze the metrics
4. **Presentation**: Data is presented via API endpoints or CLI outputs
5. **Export**: Data can be exported to files for further analysis



## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This tool is for informational purposes only and does not constitute financial advice. Always do your own research before making investment decisions. 


