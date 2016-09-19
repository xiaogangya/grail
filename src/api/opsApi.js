class opsApi {
    constructor() {
        this.domain = 'https://op-build-internal.azurewebsites.net';
        this.version = 'v1';
    }

    getDocsets(options) {
        let gitRepoUrl = options.gitRepoUrl || null;
        let status = options.status || 'NotCreated';
        return new Promise((resolve, reject) => {
            const url = `${this.domain}/${this.version}/queries/docsets?` +
                (gitRepoUrl ? `git_repo_url=${gitRepoUrl}&` : ``) + 
                `docset_query_status=${status}`;
            return fetch(url, {
                method: 'get',
                credentials: 'include'
            }).then(data => {
                return data.json().then(data => {
                    resolve(data);
                })
            }).catch(reason => {
                console.log(reason);
                return [];
            })
        });
    }

    getRepositories(options) {
        let scope = options.scope || 'op';
        return new Promise((resolve, reject) => {
            const url = `${this.domain}/${this.version}/queries/repositories?` +
                `scope=${scope}`;
            return fetch(url, {
                method: 'get',
                credentials: 'include'
            }).then(data => {
                return data.json().then(data => {
                    resolve(data);
                })
            }).catch(reason => {
                console.log(reason);
                return [];
            })
        });
    }
}
export default new opsApi();