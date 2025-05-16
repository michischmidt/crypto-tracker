# Crypto Tracker Challenge

Deployed here: https://crypto-tracker-nu-lac.vercel.app/

## Requirements

- [x] **UI to select a crypto asset symbol** (e.g., BTC, ETH, etc.)
- [x] **Loads last week's data** of that symbol from any available data source on the internet
- [x] **Stores data in local storage** (cache) to avoid loading the data frequently
- [x] **Draws a chart** with the performance comparison of last Week/Month/Year (day by day)
- [x] **Unit tests** (at least one for business logic and UI)

## Nice to Have

- [x] **Connect a self-custody wallet** (e.g., Metamask or Trust Wallet) and allow users to see the performance of their assets from the wallet
- [ ] **Compare the performance between two selected crypto assets**

## Important Notes

1. To start the project locally, copy `env.example` and create an `.env` file.
2. Uses CoinGecko open API, which can get rate limited.
3. This project was my first experience developing in the crypto field, so some "solutions" are poor practice (e.g. fetching the assets balance of a meta mask account). I'm really excited to chat with you about this field and the project! (P.S.: that's how the following points occurred)
4. For fetching all assets in the wallet, I use the Alchemy API with an API secret key, which I left in the code for demo purposes for now. But I'm not happy with this solution.
5. I attempted to display the comparison between assets in the wallet—I'll leave it in a feature branch for now. I couldn't get it running in an acceptable way.
6. Last hours on this project felt like a hackathon, but most intresting take home assignment I've ever had! :)

## Technologies Used

- Vite + TypeScript + SWC
- shadcn/ui + Tailwind CSS
- Metamask SDK + wagmi
- Alchemy.io
