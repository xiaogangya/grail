import React from 'react';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import NotificationSystem from 'react-notification-system';
import githubApi from '../api/githubApi';

export default class BranchMerger extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      details: [],
      push: false,
      processing: true
    };

    this.rows = [];
    this.selectedIndexes = [];
    this.message = {
      button: {
        withPush: 'Merge with pushing directly',
        withouthPush: 'Merge with pull request'
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
          },
          pullRequest: detail.pull
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

  compareCommits(repo) {
    return githubApi.compareCommits({
      owner: repo.account,
      repo: repo.name,
      head: this.props.fromBranch,
      base: this.props.toBranch
    }).then(data => {
      return data;
    });
  }

  getPullRequest(repo) {
    return githubApi.getPullRequest({
      owner: repo.account,
      repo: repo.name,
      head: this.props.fromBranch,
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

          return this.compareCommits(repo).then(data => {
            object.diff = data;
            return this.getPullRequest(repo).then(data => {
              if (data.length > 0) {
                object.pull = data[0];
              } else {
                object.pull = null;
              }

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
        //var name = detail.name;
        var repo = detail.repo;
        //var diff = detail.diff;
        var pull = detail.pull;

        if (this.refs.table.state.selectedRowKeys.includes(repo.locale)) {
          if (this.state.push) {
            return githubApi.merge({
              owner: repo.account,
              repo: repo.name,
              head: this.props.fromBranch,
              base: this.props.toBranch
            });
          } else {
            return this.getPullRequest(repo).then(() => {
              if (pull) {
                return githubApi.updatePullRequest({
                  owner: repo.account,
                  repo: repo.name,
                  number: pull.number,
                  title: `Merge from ${this.props.fromBranch} to ${this.props.toBranch}`
                });
              } else {
                return githubApi.createPullRequest({
                  owner: repo.account,
                  repo: repo.name,
                  title: `Merge from ${this.props.fromBranch} to ${this.props.toBranch}`,
                  head: this.props.fromBranch,
                  base: this.props.toBranch
                });
              }
            });
          }
        }
      })
    ).then(function () {
      this.refresh(this.props.context.repos, true);
      this.addNotification({
        title: 'Merger action is completed',
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

  pullRequestCellFormat(cell, row) {
    if (cell) {
      return <a href={cell.html_url} target="_blank">{ cell.title }</a >
    } else {
      return <div>not created</div>
    }
  }

  render() {
    return (
      <section className="content" style={{ "minHeight": "0px" }}>
        <div className="box box-default">
          <div className="box-header with-border">
            <h3 className="box-title">Merge branch master to live</h3>
            <div className="box-tools pull-right">
              <button className="btn btn-box-tool" data-widget="collapse"><i className="fa fa-minus"></i></button>
            </div>
          </div>
          <div className="box-body">
            <BootstrapTable data={this.rows} selectRow={this.selectRowProp} search={true} searchPlaceholder="Search locale" hover={true} striped={true} condensed={true} ref='table'>
              <TableHeaderColumn dataField="locale" isKey={true} dataSort={true}>Locale</TableHeaderColumn>
              <TableHeaderColumn dataField="repository" dataFormat={this.repositoryCellFormat}>Repository</TableHeaderColumn>
              <TableHeaderColumn dataField="account">Owner</TableHeaderColumn>
              <TableHeaderColumn dataField="diff" dataFormat={this.diffCellFormat}>Different files</TableHeaderColumn>
              <TableHeaderColumn dataField="pullRequest" dataFormat={this.pullRequestCellFormat}>Merge pull request</TableHeaderColumn>
            </BootstrapTable>
            <div className="btn-group" style={{ margin: "5px 5px", float: "right" }}>
              <button type="button" className="btn btn-default" onClick={() => this.merge() }>{ this.state.push ? this.message.button.withPush : this.message.button.withouthPush }</button>
              <button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown">
                <span className="caret"></span>
              </button>
              <ul className="dropdown-menu" role="menu">
                <li><a onClick={() => this.setState({ push: false }) }>{this.message.button.withouthPush}</a></li>
                <li><a onClick={() => this.setState({ push: true }) }>{this.message.button.withPush}</a></li>
              </ul>
            </div>
            <div className="btn-group" style={{ margin: "5px 5px", float: "right" }}>
              <button type="button" className="btn btn-default" onClick={() => this.refresh(this.props.context.repos, true) }>Refresh table</button>
            </div>
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

BranchMerger.propTypes = {
  context: React.PropTypes.object.isRequired,
  fromBranch: React.PropTypes.string,
  toBranch: React.PropTypes.string
};

BranchMerger.defaultProps = {
  fromBranch: 'master',
  toBranch: 'live'
};

window.pluginActions.register('DOCSET_PAGE', 'BranchMerger', BranchMerger);