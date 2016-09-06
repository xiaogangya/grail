import React from 'react'
import githubApi from '../api/githubApi'

export default class Release extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedLocales: []
    };
  }

  selectLocales(event) {
    let options = event.target.options;
    this.state.selectedLocales = [];
    if (options) {
      for (let i = 0; i < options.length; ++i) {
        if (options[i].selected) {
          this.state.selectedLocales.push(options[i].value);
        }
      }
    }
  }

  merge() {
    this.props.context.repos.forEach(repo => {
      if (this.state.selectedLocales.includes(repo.locale)) {
        console.log(repo);

        githubApi.createPullRequest({
          owner: repo.account,
          repo: repo.name,
          title: `Release from ${this.props.fromBranch} to ${this.props.toBranch}`,
          head: this.props.fromBranch,
          base: this.props.toBranch
        }).then(data => {
          console.log(data)
        });
      }
    });
  }

  render() {
    return (
      <section className="content">
        <div className="nav-tabs-custom">
          <div className="tab-content">
            <div className="nav-breadcrumb">
              <ol className="breadcrumb">
                <li>Release</li>
              </ol>
            </div>
            <div className="box">
              <div className="form-group">
                <label for="localeOptions">Select locales</label>
                <select multiple className="form-control" id="localeOptions" onChange={ event => this.selectLocales(event) }>
                  {
                    this.props.context.repos.map(repo => {
                      return <option key={ repo.locale }>{ repo.locale }</option>
                    })
                  }
                </select>
              </div>
              <button onClick={ () => this.merge() }>Release from { this.props.fromBranch } to { this.props.toBranch }</button>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

Release.propTypes = {
  context: React.PropTypes.object.isRequired,
  fromBranch: React.PropTypes.string,
  toBranch: React.PropTypes.string,
  pullRequest: React.PropTypes.bool
};

Release.defaultProps = {
  fromBranch: 'master',
  toBranch: 'live',
  pullRequest: true
};

window.pluginActions.register('DOCSET_PAGE', 'Release', Release);