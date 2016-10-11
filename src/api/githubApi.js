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
      const url = `${this.domain}/github/repos/${owner}/${repo}/compare/${base}/${head}`;
      const payload = {
        user: window.userStore.getUser()
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
        return resolve({});
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
        return resolve({});
      })
    });
  }

  getRef(options) {
    let owner = options.owner || null;
    let repo = options.repo || null;
    return new Promise((resolve, reject) => {
      const url = `${this.domain}/github/repos/${owner}/${repo}/refs/get`;
      const payload = {
        user: window.userStore.getUser(),
        options: {
          ref: options.ref || null
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
        return resolve({});
      })
    });
  }

  createRef(options) {
    let owner = options.owner || null;
    let repo = options.repo || null;
    return new Promise((resolve, reject) => {
      const url = `${this.domain}/github/repos/${owner}/${repo}/refs/create`;
      const payload = {
        user: window.userStore.getUser(),
        options: {
          ref: options.ref || '',
          sha: options.sha || ''
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
        return resolve({});
      })
    });
  }

  updateRef(options) {
    let owner = options.owner || null;
    let repo = options.repo || null;
    return new Promise((resolve, reject) => {
      const url = `${this.domain}/github/repos/${owner}/${repo}/refs/update`;
      const payload = {
        user: window.userStore.getUser(),
        options: {
          ref: options.ref || null,
          sha: options.sha || '',
          force: options.force || false
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
        return resolve({});
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
        return resolve({});
      })
    });
  }

  createPullRequest(options) {
    let owner = options.owner || null;
    let repo = options.repo || null;
    return new Promise((resolve, reject) => {
      const url = `${this.domain}/github/repos/${owner}/${repo}/pulls/create`;
      const user = window.userStore.getUser();
      const payload = {
        user: user,
        options: {
          title: `${user.name} from OPS portal: ${options.title}`,
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
        return resolve({});
      })
    });
  }

  updatePullRequest(options) {
    let owner = options.owner || null;
    let repo = options.repo || null;
    let number = options.number || 0;
    return new Promise((resolve, reject) => {
      const url = `${this.domain}/github/repos/${owner}/${repo}/pulls/${number}/update`;
      const user = window.userStore.getUser();
      const payload = {
        user: user,
        options: {
          title: `${user.name} from OPS portal: ${options.title}`
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
        return resolve({});
      })
    });
  }

  getContent(options) {
    let owner = options.owner || null;
    let repo = options.repo || null;
    return new Promise((resolve, reject) => {
      const url = `${this.domain}/github/repos/${owner}/${repo}/contents/get`;
      const payload = {
        user: window.userStore.getUser(),
        options: {
          path: options.path || '',
          ref: options.ref || ''
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
        return resolve({});
      })
    });
  }

  updateContent(options) {
    let owner = options.owner || null;
    let repo = options.repo || null;
    return new Promise((resolve, reject) => {
      const url = `${this.domain}/github/repos/${owner}/${repo}/contents/update`;
      const payload = {
        user: window.userStore.getUser(),
        options: {
          path: options.path || '',
          message: options.message || '',
          content: options.content || '',
          sha: options.sha || '',
          branch: options.branch || ''
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
        return resolve({});
      })
    });
  }
}
export default new githubApi();