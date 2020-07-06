module.exports = {
    PORT: process.env.PORT || 8000,
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://dunder_mifflin@localhost/Noteful',
    CLIENT_ORIGIN: 
      // "https://noteful-kappa-ivory.now.sh"
      // "https://noteful.jonretchless.vercel.app",
      "http://localhost:3000"
  }