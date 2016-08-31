import React from 'react';
import opsApi from '../api/opsApi';
import githubApi from '../api/githubApi';

class Release extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      repositories: [],

      docsetOptions: [],
      localeOptions: [],
      selectedDocset: null,
      selectedLocales: []
    };
  }

  componentDidMount() {
    this.getDocsetOptions().then(function (docsets) {
      opsApi.getRepositories({ scope: 'op' }).then(function (repositories) {
        this.setState({
          repositories: repositories,
          docsetOptions: docsets,
          selectedDocset: docsets.length > 0 ? docsets[0] : null
        });
      }.bind(this))
    }.bind(this));
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.selectedDocset) {
      nextState.localeOptions = this.getLocaleOptions(nextState.selectedDocset);
    }
  }

  getDocsetOptions() {
    return opsApi.getDocsets({ status: 'created' }).then(data => {
      var docsets = [];

      data.forEach(docset => {
        let index = docsets.findIndex(x => {
          return x.name === docset.name;
        })
        if (index == -1) {
          docsets.push({
            name: docset.name,
            items: [docset]
          })
        } else {
          docsets[index].items.push(docset);
        }
      });

      return docsets;
    })
  }

  getLocaleOptions(docset) {
    return docset.items.map(x => {
      return x.locale;
    })
  }

  selectDocset(event) {
    let index = this.state.docsetOptions.findIndex(x => {
      return x.name === event.target.value;
    })
    if (index > -1) {
      this.state.selectedDocset = this.state.docsetOptions[index];
      this.setState({
        selectedDocset: this.state.docsetOptions[index]
      });
    }
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
    this.state.selectedDocset.items.forEach(item => {
      if (this.state.selectedLocales.includes(item.locale)) {
        let repository = this.state.repositories.find(x => {
          return x.id === item.repository_id;
        });

        if (repository) {
          console.log(repository)

          githubApi.createPullRequest({
            owner: repository.account,
            repo: repository.name,
            title: `Release from ${this.props.fromBranch} to ${this.props.toBranch}`,
            head: this.props.fromBranch,
            base: this.props.toBranch
          }).then(data => {
            console.log(data);
          });
        }
      }
    });
  }

  render() {
    return (
      <section className="content">
        <div className="form-group">
          <label for="docsetOptions">Select docset</label>
          <select className="form-control" id="docsetOptions" onChange={ event => this.selectDocset(event) }>
            {
              this.state.docsetOptions.map(docset => {
                return <option key={ docset.name }>{ docset.name }</option>
              })
            }
          </select>

          <label for="localeOptions">Select locales</label>
          <select multiple className="form-control" id="localeOptions" onChange={ event => this.selectLocales(event) }>
            {
              this.state.localeOptions.map(locale => {
                return <option key={ locale }>{ locale }</option>
              })
            }
          </select>
        </div>
        <button onClick={ () => this.merge() }>Release from { this.props.fromBranch } to { this.props.toBranch }</button>
      </section>
    );
  }
}

Release.propTypes = {
  fromBranch: React.PropTypes.string,
  toBranch: React.PropTypes.string,
  pullRequest: React.PropTypes.bool
};

Release.defaultProps = {
  fromBranch: 'master',
  toBranch: 'live',
  pullRequest: true
};

window.pluginActions.register('Release', Release);