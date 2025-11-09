# البيلسان أونلاين – Backend

REST API powering the modest fashion shop. Built with Express, MongoDB, and Cloudinary.

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in values.
3. Run the dev server:
   ```bash
   npm run dev
   ```

## Environment Variables

- `PORT` – Server port (default `5000`)
- `MONGO_URI` – MongoDB Atlas connection string
- `JWT_SECRET` – Secret key for JSON Web Tokens
- `CORS_ORIGIN` – Allowed origin for CORS
- `CLOUDINARY_CLOUD_NAME` – Cloudinary cloud name
- `CLOUDINARY_API_KEY` – Cloudinary API key
- `CLOUDINARY_API_SECRET` – Cloudinary API secret

## Scripts

- `npm run dev` – Start development server with nodemon
- `npm start` – Start production server

