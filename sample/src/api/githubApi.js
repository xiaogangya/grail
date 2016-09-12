class githubApi {
  constructor() {
    this.domain = '';
  }

  compareCommits(options) {
    let owner = options.owner || null;
    let repo = options.repo || null;
    let base = options.base || 'live';
    let head = options.head || 'master';
    return new Promise((resolve, reject) => {
      const url = `${this.domain}/github/repos/${owner}/${repo}/compare/${base}...${head}`;
      const payload = {
        user: window.userStore.getUser()
      };
      return fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: 'post',
        body: JSON.stringify(payload)
      }).then(response => {
        return response.json();
      }).then(data => {
        return resolve(data);
      }).catch(reason => {
        return {};
      })
    });
  }

  merge(options) {
    let owner = options.owner || null;
    let repo = options.repo || null;
    return new Promise((resolve, reject) => {
      const url = `${this.domain}/github/repos/${owner}/${repo}/merges`;
      const payload = {
        user: window.userStore.getUser(),
        options: {
          head: options.head || 'master',
          base: options.base || 'live'
        }
      };
      return fetch(url, {
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        method: 'post',
        body: JSON.stringify(payload)
      }).then(response => {
        return response.json();
      }).then(data => {
        return resolve(data);
      }).catch(reason => {
        return {};
      })
    });
  }

  getPullRequest(options) {
    let owner = options.owner || null;
    let repo = options.repo || null;
    return new Promise((resolve, reject) => {
      const url = `${this.domain}/github/repos/${owner}/${repo}/pulls/get`;
      const payload = {
        user: window.userStore.getUser(),
        options: {
          head: options.head || 'master',
          base: options.base || 'live'
        }
      };
      return fetch(url, {
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        method: 'post',
        body: JSON.stringify(payload)
      }).then(response => {
        return response.json();
      }).then(data => {
        return resolve(data);
      }).catch(reason => {
        return {};
      })
    });
  }

  createPullRequest(options) {
    let owner = options.owner || null;
    let repo = options.repo || null;
    return new Promise((resolve, reject) => {
      const url = `${this.domain}/github/repos/${owner}/${repo}/pulls/create`;
      const payload = {
        user: window.userStore.getUser(),
        options: {
          title: options.title ? `OPS protal: ${options.title}` : 'OPS portal',
          head: options.head || 'master',
          base: options.base || 'live'
        }
      };
      return fetch(url, {
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        method: 'post',
        body: JSON.stringify(payload)
      }).then(response => {
        return response.json();
      }).then(data => {
        return resolve(data);
      }).catch(reason => {
        return {};
      })
    });
  }

  updatePullRequest(options) {
    let owner = options.owner || null;
    let repo = options.repo || null;
    let number = options.number || 0;
    return new Promise((resolve, reject) => {
      const url = `${this.domain}/github/repos/${owner}/${repo}/pulls/${number}/update`;
      const payload = {
        user: window.userStore.getUser(),
        options: {
          title: options.title ? `OPS protal: ${options.title}` : 'OPS portal'
        }
      };
      return fetch(url, {
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        method: 'post',
        body: JSON.stringify(payload)
      }).then(response => {
        return response.json();
      }).then(data => {
        return resolve(data);
      }).catch(reason => {
        return {};
      })
    });
  }
}
export default new githubApi();