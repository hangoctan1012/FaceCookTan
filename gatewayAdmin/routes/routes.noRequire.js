module.exports = {
  "/stat/login": process.env.STATIC_URL || "http://localhost:7001",
  "/api/users": process.env.USER_URL || "http://localhost:3002",
  "/api/post": process.env.POST_URL || "http://localhost:4001",
  "/api/recipe": process.env.RECIPE_URL || "http://localhost:5001",
  "/api/userAdmin": process.env.USER_URL || "http://localhost:3002",
  "/api/postAdmin": process.env.POST_URL || "http://localhost:4001",
  "/stat/search": process.env.STATIC_URL || "http://localhost:7001",
};
