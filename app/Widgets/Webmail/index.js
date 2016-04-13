import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions } from '../../redux/actions';
import Inbox from './Inbox';

export class WebmailWidget extends React.Component {
  static propTypes = {
    getInbox: React.PropTypes.func.isRequired,
    getEmail: React.PropTypes.func.isRequired,
    user: React.PropTypes.object.isRequired,
    inbox: React.PropTypes.object,
    emailId: React.PropTypes.string,
    email: React.PropTypes.object,
    isFetching: React.PropTypes.bool,
    isFetchingEmail: React.PropTypes.bool,
  };

  componentDidMount() {
    this.props.getInbox(this.props.user);
  }

  showInbox = () => {
    return <Inbox inbox={this.props.inbox} showEmail={this.showEmail} />;
  }
  showEmail = () => {
    return null;
  }
  render() {
    console.log(this.props.inbox);
    return this.props.inbox ? this.showInbox(): <div>Loading bruh!</div>;
  }
}

function mapDispatchToProps(dispatch) {
  return { ...bindActionCreators(actions, dispatch) };
}

function mapStateToProps(state) {
  return { user: state.reducer.login, ...state.reducer.webmail };
}

export default connect(mapStateToProps, mapDispatchToProps)(WebmailWidget);
