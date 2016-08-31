class githubApi {
    constructor() {
        this.domain = '';
    }

    createPullRequest(options) {
        let owner = options.owner || null;
        let repo = options.repo || null;
        return new Promise((resolve, reject) => {
            const url = `${this.domain}/github/repos/${owner}/${repo}/pulls`;
            const payload = {
                options: {
                    title: options.title || 'no title',
                    head: options.head || 'master',
                    base: options.base || 'live'
                }
            };
            return fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'post',
                body: JSON.stringify(payload)
            }).then(data => {
                return resolve(data);
            }).catch(reason => {
                console.log(reason);
                return {};
            })
        })
    }
}
export default new githubApi();