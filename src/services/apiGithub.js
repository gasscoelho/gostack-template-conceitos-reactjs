import axios from "axios";

const headers = {
  Authorization: `token ${process.env.REACT_APP_GITHUB_PERSONAL_TOKEN}`,
};

const apiGithub = axios.create({
  baseURL: "https://api.github.com",
  // headers, // Uncomment this line in case you have a personal Github token
});

export default apiGithub;

/*
  You don't need to have a personal token in order to make a request to the GitHub API. 

  The only limit you'll have is related to the rate limit (X-RateLimit-Limit).

  - For unauthenticated requests, the rate limit allows for up to 60 requests per hour
  - For API requests using Basic Authentication or OAuth, you can make up to 5000 requests per hour.

  For more details about GitHub API you can check the URL below
  https://developer.github.com/v3/
*/
