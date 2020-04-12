import React, { useState, useEffect } from "react";

import "./styles.css";

import api from "./services/api";

import apiGithub from "./services/apiGithub";

function App() {
  const [repositories, setRepositories] = useState([]);

  const [githubRepositories, setGithubRepositories] = useState([]);

  const username = "gasscoelho";

  // Fetch repositories
  useEffect(() => {
    api.get("repositories").then((res) => {
      setRepositories(res.data);
    });
  }, []);

  // Fetch Github repositories
  useEffect(() => {
    apiGithub.get(`users/${username}/repos`).then((res) => {
      setGithubRepositories(res.data);
    });
  }, []);

  async function handleAddRepository() {
    try {
      let data = {};

      // Skip this function for test environment
      if (process.env.REACT_APP_ENV !== "test") {
        data = await getRandomGithubRepository();
      }

      const newRepository = (await api.post("repositories", data)).data;

      setRepositories([...repositories, newRepository]);
    } catch (err) {
      // Handle Error
      console.log(err.message);
      alert(
        `This action could not be processed. You reached your personal limit (${githubRepositories.length}) to add new repositories.`
      );
    }
  }

  async function handleRemoveRepository(id) {
    await api.delete(`repositories/${id}`);

    const index = repositories.findIndex((repo) => repo.id === id);

    // Remove a repository at a specific index
    repositories.splice(index, 1);

    setRepositories([...repositories]);
  }

  /**
   * Goal: Get a random github repository
   *
   * We have a list of Github repositories and the goal is to add one of them in our repository list from our back-end
   *
   * Business Logic
   * 1. We don't want to add a repeated Github repository in our list (back-end)
   * 2. In case all Github repositories are already added in our back-end then we need to return an error informing
   * that wasn't possible to add a new repository.
   */
  async function getRandomGithubRepository() {
    const availablesGithubRepos = [];

    githubRepositories.map((repoGithub) => {
      // Check if the GitHub repository exist in our back-end
      const isAvailable = !repositories.some(
        (repo) => repo.title.toLowerCase() === repoGithub.name.toLowerCase()
      );

      // If the GitHub repository does not exist in our back-end then we set this repository as available
      if (isAvailable) {
        availablesGithubRepos.push(repoGithub);
      }
    });

    // Check if there is an available Github repositories
    if (availablesGithubRepos.length === 0) {
      throw new Error("None Github repository available 😕");
    }

    // Get a random integer between 0 and amount of available GitHub repositories
    const randomIndex = Math.floor(
      Math.random() * availablesGithubRepos.length
    );

    // Prepare an object to send the params to the getGithubRepositoryLanguages function
    const params = {
      owner: availablesGithubRepos[randomIndex].owner.login,
      name: availablesGithubRepos[randomIndex].name,
    };

    // Get techs (languages) from the repository
    const techs = (await getGithubRepositoryLanguages(params)).data;

    /**
     * The return of techs variable is something like this:
     *
     * {
     *    "Dart": 13244,
     *    "Java": 367,
     *    "JavaScript": 753
     * }
     *
     * So in this case we are grabbing only the Key of each element and converting it in an Array
     *
     * The result of techsArray should be:
     * ["Dart", "Java", "JavaScript"]
     */
    // Convert techs to an Array
    var techsArray = Object.keys(techs).map((key) => {
      return key;
    });

    const repo = {
      title: availablesGithubRepos[randomIndex].name,
      url: availablesGithubRepos[randomIndex].url,
      techs: techsArray,
    };

    return repo;
  }

  function getGithubRepositoryLanguages({ owner, name }) {
    return apiGithub.get(`repos/${owner}/${name}/languages`);
  }

  return (
    <div>
      <ul data-testid="repository-list">
        {repositories.map((repo) => (
          <li key={repo.id}>
            {repo.title}
            <button onClick={() => handleRemoveRepository(repo.id)}>
              Remover
            </button>
          </li>
        ))}
      </ul>

      <button onClick={handleAddRepository}>Adicionar</button>
    </div>
  );
}

export default App;
