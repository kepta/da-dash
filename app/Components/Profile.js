import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, Input } from 'react-bootstrap';
import { actions } from '../redux/actions';


class Profile extends Component {


  static propTypes = {
    actions: React.PropTypes.object.isRequired,
    ID: React.PropTypes.string.isRequired,
    profile: React.PropTypes.object.isRequired,
  }

  state = {
    text: '',
    isEditName: false,
  }

  componentWillMount() {
    const id= this.props.ID;
    this.props.actions.setProfileId(id);
  }

  componentDidMount() {
    this.props.actions.getProfileName(this.props.ID);
  }


  onTextChange = (e) => {
    this.setState({
      text: e.target.value,
    });
  }

  handleDoubleClick = () => {
    // console.log('double clickkkkkkkkkkkkkkkk');
    this.setState({
      isEditName: true,
      text: this.props.profile.name,
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const id= this.props.ID;
    // console.log('ID ' + id + 'Name ' + this.state.text);
    this.props.actions.setProfileName(id, this.state.text);
    this.state.isEditName= false;
    this.setState({
      text: '',
    });
  }

  render() {
    // console.log(this.props);
    // console.log(this.props.profile.id);
    // console.log(this.state.isEditName);
    const nameComp = (this.props.profile.name === null || this.state.isEditName === true) ? (
      <form onSubmit={this.handleSubmit} style={{ width: '400px' }}>
          <Input
            label="Name: "
            className="chat textfield"
            type="text"
            bsSize="large"
            placeholder= "Enter Name"
            value= {this.state.text}
            onChange={this.onTextChange}
          />
        <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
          <Button
            className="chat raised"
            bsStyle="default"
            type="submit"
            style={{ padding: '10px' }}
          >
            Submit
          </Button>
        </div>
      </form>
    )
    :
    (
      <div onDoubleClick={this.handleDoubleClick}>
        <p >Name: {this.props.profile.name}</p>
      </div>
    );
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Img />
        <p>ID: {this.props.ID}</p>
        {nameComp}
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch),
  };
}

function mapStateToProps(state) {
  return { ID: state.reducer.login.ID, profile: state.reducer.profile };
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile);


const Img = () => {
  return (
    <div>
      <img
        src="https://image.freepik.com/free-icon/male-user-shadow_318-34042.png"
        style={{ width: '400px', height: '400px' }}
      />
    </div>
  );
};
