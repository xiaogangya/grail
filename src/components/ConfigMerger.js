import React from 'react';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import NotificationSystem from 'react-notification-system';

const path = require('path');

export default class ConfigMerger extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      details: [],
      baseLocale: 'en-us',
      fromBranch: this.props.fromBranchPrefix + 'en-us',
      processing: true
    };

    this.rows = [];
    this.selectedIndexes = [];
    this.message = {
      button: {
        withPush: 'Merge with pushing directly'
      }
    };
    this.notificationSystem = null;

    this.selectRowProp = {
      mode: "checkbox",
      clickToSelect: true,
      bgColor: "rgba(37, 139, 212, 0.26)"
    };
  }

  componentWillMount() {
    this.refresh(this.props.context.repos);
  }

  componentDidMount() {
    this.notificationSystem = this.refs.notificationSystem;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.context.docset === this.props.context.docset) {
      if (nextProps.context.repos.length === this.props.context.repos.length) {
        var same = true;
        for (var i = 0; i < nextProps.context.repos.length; ++i) {
          if (this.props.context.repos.findIndex(x => x.name === nextProps.context.repos[i].name) < 0) {
            same = false;
            break;
          }
        }
        if (same) return;
      }
    }
    this.refresh(nextProps.context.repos);
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.details.findIndex(x => x.refresh) >= 0) {
      this.selectedIndexes = [];

      // keep the sort of rows
      this.rows = this.rows.filter(x => {
        return nextState.details.findIndex(y => y.repo.locale === x.locale) >= 0;
      });
      nextState.details.forEach(detail => {
        var data = {
          locale: detail.repo.locale,
          repository: { name: detail.repo.name, url: detail.repo.git_repo_url, detail: detail.repo },
          account: detail.repo.account,
          diff: {
            status: detail.diff.status,
            url: detail.diff.html_url,
            files: detail.diff.files
          }
        };

        var index = this.rows.findIndex(x => {
          return x.locale === detail.repo.locale;
        });
        if (index >= 0) {
          this.rows[index] = data;
        } else {
          this.rows.push(data);
        }
      });
    }
  }

  baseLocaleChange(locale) {
    const force = this.state.baseLocale !== locale;
    this.setState({
      baseLocale: locale,
      fromBranch: this.props.fromBranchPrefix + locale
    });
    this.refresh(this.props.context.repos, force);
  }

  prepareConfigs(repo) {
    return githubApi.getRef({
      owner: repo.account,
      repo: repo.name,
      ref: path.join('heads', this.state.fromBranch)
    }).then(data => {
      let exist = false;
      if (data.constructor === Object) {
        if (Object.keys(data).length > 0 && data.ref && data.ref === path.join('refs/heads', this.state.fromBranch)) {
          exist = true;
        }
      } else if (data.constructor === Array) {
        data.forEach(x => {
          if (Object.keys(x).length > 0 && x.ref && x.ref === path.join('refs/heads', this.state.fromBranch)) {
            exist = true;
          }
        });
      }

      return githubApi.getRef({
        owner: repo.account,
        repo: repo.name,
        ref: path.join('heads', this.props.toBranch)
      }).then(data => {
        if (!exist) {
          // create fromBranch based on toBranch if not exist
          return githubApi.createRef({
            owner: repo.account,
            repo: repo.name,
            ref: path.join('refs/heads', this.state.fromBranch),
            sha: data.object.sha
          });
        } else {
          // force update fromBranch
          return githubApi.updateRef({
            owner: repo.account,
            repo: repo.name,
            ref: path.join('heads', this.state.fromBranch),
            sha: data.object.sha,
            force: true
          });
        }
      });
    }).then(data => {
      var baseRepo = this.props.context.repos.find(x => x.locale === this.state.baseLocale);
      if (!baseRepo) {
        return;
      }

      var getContentPromises = [
        githubApi.getContent({ owner: baseRepo.account, repo: baseRepo.name, path: this.props.repoConfig, ref: this.props.toBranch }),
        githubApi.getContent({ owner: baseRepo.account, repo: baseRepo.name, path: path.join(this.props.context.docset.base_path, this.props.docsetConfig), ref: this.props.toBranch }),
        githubApi.getContent({ owner: repo.account, repo: repo.name, path: this.props.repoConfig, ref: this.state.fromBranch }),
        githubApi.getContent({ owner: repo.account, repo: repo.name, path: path.join(this.props.context.docset.base_path, this.props.docsetConfig), ref: this.state.fromBranch })
      ];

      return Promise.all(getContentPromises).then(data => {
        var updateContentPromises = [
          githubApi.updateContent({
            owner: repo.account,
            repo: repo.name,
            path: this.props.repoConfig,
            message: 'Portal: merge repository config from ' + this.state.baseLocale,
            content: data[0].content,
            sha: data[2].sha,
            branch: this.state.fromBranch
          }),
          githubApi.updateContent({
            owner: repo.account,
            repo: repo.name,
            path: path.join(this.props.context.docset.base_path, this.props.docsetConfig),
            message: 'Portal: merge docset config from ' + this.state.baseLocale,
            content: data[1].content,
            sha: data[3].sha,
            branch: this.state.fromBranch
          })
        ];
        return Promise.all(updateContentPromises).then(data => {
          return data;
        });
      });
    });
  }

  compareConfigs(repo) {
    return githubApi.compareCommits({
      owner: repo.account,
      repo: repo.name,
      head: this.state.fromBranch,
      base: this.props.toBranch
    }).then(data => {
      return data;
    });
  }

  refresh(repos, force = false) {
    this.setState({
      processing: true
    });

    var details = [];
    Promise.all(
      repos.map(repo => {
        var object = {};

        var i = this.state.details.findIndex(x => x.name === repo.name);
        if (i >= 0) {
          object = this.state.details[i];
          object.refresh = false;
        }

        if (force || !object.name) {
          object.refresh = true;
          object.name = repo.name;
          object.repo = repo;

          return this.prepareConfigs(repo).then(data => {
            return this.compareConfigs(repo).then(data => {
              object.diff = data;
              details.push(object);
            });
          });
        } else {
          details.push(object);
        }
      })
    ).then(function () {
      this.setState({
        details: details,
        processing: false
      });
    }.bind(this));
  }

  merge() {
    this.setState({
      processing: true
    });

    Promise.all(
      this.state.details.map(detail => {
        var repo = detail.repo;

        if (this.refs.table.state.selectedRowKeys.includes(repo.locale)) {
          return githubApi.merge({
            owner: repo.account,
            repo: repo.name,
            head: this.state.fromBranch,
            base: this.props.toBranch
          });
        }
      })
    ).then(function () {
      this.refresh(this.props.context.repos, true);
      this.addNotification({
        title: 'Release action is completed',
        message: 'Please wait for updates in the table',
        level: 'success',
        position: 'br',
        autoDismiss: 10
      });
    }.bind(this));
  }

  addNotification(options) {
    this.notificationSystem.addNotification({
      title: options.title,
      message: options.message,
      level: options.level,
      position: options.position,
      autoDismiss: options.autoDismiss
    });
  }

  repositoryCellFormat(cell, row) {
    return <a href={cell.url} target="_blank">{cell.name}</a>
  }

  statusCellFormat(cell, row) {
    return <a href={cell.url} target="_blank">{cell.name}</a>
  }

  diffCellFormat(cell, row) {
    return <a href={cell.url} target="_blank">{cell.files.length} {cell.files.length === 1 ? 'file' : 'files'}</a>
  }

  render() {
    return (
      <section className="content" style={{ "minHeight": "0px" }}>
        <div className="box box-default">
          <div className="box-header with-border">
            <h3 className="box-title">Merge configurations on master branch from specific locale</h3>
            <div className="box-tools pull-right">
              <button className="btn btn-box-tool" data-widget="collapse"><i className="fa fa-minus"></i></button>
            </div>
          </div>
          <div className="box-body">
            <form>
              <div className="form-group">
                <label>From locale</label>
                <div className="btn-group" style={{ marginLeft: "10px" }}>
                  <button type="button" className="btn btn-default">{this.state.baseLocale}</button>
                  <button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown">
                    <span className="caret"></span>
                  </button>
                  <ul className="dropdown-menu" role="menu">
                    {
                      this.state.details.map(x => {
                        return <li key={x.repo.locale}><a onClick={() => this.baseLocaleChange(x.repo.locale) }>{x.repo.locale}</a></li>;
                      })
                    }
                  </ul>
                </div>
              </div>
              <div className="form-group">
                <label>To locale(s) </label>
                <BootstrapTable style={{ marginTop: "-20px" }} data={this.rows} selectRow={this.selectRowProp} search={true} searchPlaceholder="Search locale" hover={true} striped={true} condensed={true} ref='table'>
                  <TableHeaderColumn dataField="locale" isKey={true} dataSort={true}>Locale</TableHeaderColumn>
                  <TableHeaderColumn dataField="repository" dataFormat={this.repositoryCellFormat}>Repository</TableHeaderColumn>
                  <TableHeaderColumn dataField="account">Owner</TableHeaderColumn>
                  <TableHeaderColumn dataField="diff" dataFormat={this.diffCellFormat}>Pull request</TableHeaderColumn>
                </BootstrapTable>
              </div>
              <div className="btn-group" style={{ margin: "5px 5px", float: "right" }}>
                <button type="button" className="btn btn-default" data-toggle="modal" data-target="#confirmModal">{this.message.button.withPush}</button>
                <div className="modal fade" id="confirmModal" role="dialog">
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h4 className="modal-title">Merge configurations</h4>
                      </div>
                      <div className="modal-body">
                        <p>Do you confirm to push configuration changes directly?</p>
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-default" data-dismiss="modal" onClick={() => this.merge()}>Confirm</button>
                        <button type="button" className="btn btn-default" data-dismiss="modal">Cancel</button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
              <div className="btn-group" style={{ margin: "5px 5px", float: "right" }}>
                <button type="button" className="btn btn-default" onClick={() => this.refresh(this.props.context.repos, true) }>Refresh table</button>
              </div>
            </form>
          </div>
          <div className="box-footer">
            <div>
              <NotificationSystem ref="notificationSystem" />
            </div>
          </div>
          {
            this.state.processing ?
              <div className="overlay">
                <i className="fa fa-refresh fa-spin"></i>
              </div>
              : null
          }
        </div>
      </section>
    );
  }
}

ConfigMerger.propTypes = {
  context: React.PropTypes.object.isRequired,
  fromBranchPrefix: React.PropTypes.string,
  toBranch: React.PropTypes.string,
  repoConfig: React.PropTypes.string,
  docsetConfig: React.PropTypes.string
};

ConfigMerger.defaultProps = {
  fromBranchPrefix: 'portal-merge-config-from-',
  toBranch: 'master',
  repoConfig: '.openpublishing.publish.config.json',
  docsetConfig: 'docfx.json'
};

window.pluginActions.register('DOCSET_PAGE', 'ConfigMerger', ConfigMerger);