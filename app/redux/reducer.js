import { combineReducers } from 'redux';
import Immutable from 'immutable';
import arrayFrom from 'array-from';
const INBOX_LIMIT = 20;
import {
  CREATE_TODO,
  DELETE_TODO,
  COMPLETE_TODO,
  EDIT_TODO,
  FILL_TODOS,
  GETTING_TODOS,
} from './todoActions';

import {
  LOGGED_IN,
  LOGGED_OUT,
  LOGGING,
  LOGIN_ERROR,
  SET_CREDENTIALS,
} from './loginActions';

import {
  REQUEST_INTRANET_TREE,
  RECEIVE_INTRANET_TREE,
  RECEIVE_INTRANET_ERROR,
  GO_FORWARD,
  GO_TO_PATH,
  ADD_FAV,
  QUICK_SEARCH,
  LONG_SEARCH,
  SEARCH_ERROR,
} from './intranetActions';

import {
  RECEIVE_INBOX,
  REQUEST_INBOX,
  RECEIVE_INBOX_ERROR,
  REQUEST_EMAIL,
  RECEIVE_EMAIL,
  RECEIVE_EMAIL_ERROR,
} from './webmailActions';

import {
  ADD_TO_WIDGETS,
} from './dashboardActions';

import { CLEAR_CHAT, RECEIVED_CHAT } from './chatActions';

import {
  SET_PROFILE_ID,
  GETTING_PROFILE_NAME,
  GOT_PROFILE_NAME,
  GOT_ERROR,
  SETTING_PROFILE_NAME,
 } from './profileActions';

const initialLoginState = {
  STATUS: LOGGED_OUT,
  ERROR: '',
  ID: null,
  PASS: null,
};

const getId = (state) => {
  return state.todos.reduce((maxId, todoItem) => {
    return Math.max(todoItem.ID, maxId);
  }, -1) + 1;
};

const todoState = {
  todos: [{
    ID: 0,
    completed: false,
    TEXT: 'First Todo',
  }, {
    ID: 1,
    completed: false,
    TEXT: 'Second Todo',
  }],
  gettingTodos: true,
};

const chatState = {
  chats: [{
    id: 'First',
    message: 'message',
    time: '01',
  },
  ],
};

export function todo(state = todoState, action) {
  switch (action.type) {

    case CREATE_TODO:
      return Object.assign({}, state, {
        todos: [...state.todos, {
          ID: getId(state),
          completed: false,
          TEXT: action.TEXT,
        }],
        gettingTodos: false,
      });

    case DELETE_TODO:
      return Object.assign({}, state, {
        todos: state.todos.filter((todoItem) => {
          return todoItem.ID !== action.ID;
        }),
        gettingTodos: false,
      });

    case COMPLETE_TODO:
      return Object.assign({}, state, {
        todos: state.todos.map((todoItem) => {
          return todoItem.ID === action.ID ? Object.assign({}, todoItem, { completed: !todoItem.completed }) : todoItem;
        }),
        gettingTodos: false,
      });

    case EDIT_TODO:
      return Object.assign({}, state, {
        todos: state.todos.map((todoItem) => {
          return todoItem.ID === action.TODO.ID ? Object.assign({}, todoItem, { TEXT: action.TODO.TEXT }) : todoItem;
        }),
        gettingTodos: false,
      });
    case FILL_TODOS:
      return Object.assign({}, state, action.todos);
    case GETTING_TODOS:
      return Object({}, state, {
        gettingTodos: true,
      });
    default: {
      return state;
    }
  }
}

export function login(state = initialLoginState, action) {
  switch (action.type) {
    case LOGGED_IN:
      return Object.assign({}, state, {
        STATUS: action.type,
      });
    case LOGGED_OUT:
      return Object.assign({}, state, {
        STATUS: action.type,
        ID: null,
        PASS: null,
      });
    case LOGGING:
      return Object.assign({}, state, {
        STATUS: action.type,
      });
    case LOGIN_ERROR:
      return Object.assign({}, state, {
        STATUS: action.type,
        ERROR: action.error,
      });
    case SET_CREDENTIALS:
      return Object.assign({}, state, {
        STATUS: LOGGED_OUT,
        ID: action.id,
        PASS: action.pass,
      });
    default:
      return state;
  }
}

const initialIntranetState = {
  isFetching: false,
  path: [],
  pathString: [],
  tree: null,
  error: null,
  location: null,
  timeStamp: null,
  fav: Immutable.fromJS([{
    isFile: false,
    name: 'Intranet',
    path: [],
  }]),
};

export function traverseIntranet(tree, path) {
  return path.reduce((prev, cur) => {
    return prev.get(cur);
  }, tree);
}

export function processLocation(loc, path) {
  return Immutable.fromJS(arrayFrom(loc.keys()).sort((a, b) => a.charCodeAt(0) - b.charCodeAt(0)).map(key => {
    return {
      isFile: loc.get(key) === 'file',
      name: key,
      path: path.concat(key),
    };
  }));
}

function checkFav(favList, newFav) {
  let array = favList.toArray();
  array = array.filter((e) => {
    return e.get('name') !== newFav.get('name');
  });
  if (array.length === favList.count()) {
    return favList.push(newFav);
  }
  return Immutable.fromJS(array);
}

export function intranet(state=initialIntranetState, action) {
  let newSearchObj;
  let tree;
  let location;
  let pathString;

  switch (action.type) {
    case REQUEST_INTRANET_TREE:
      return Object.assign({}, state, {
        isFetching: true,
        error: null,
        location: null,
      });

    case RECEIVE_INTRANET_TREE:
      tree = Immutable.fromJS(action.tree);
      location = traverseIntranet(tree, state.pathString);
      return Object.assign({}, state, {
        isFetching: false,
        error: null,
        tree,
        timeStamp: action.timeStamp,
        lastFetched: Date.now(),
        location: processLocation(location, state.pathString),
      });

    case RECEIVE_INTRANET_ERROR:
      return Object.assign({}, state, {
        isFetching: false,
        error: action.error,
        location: [],
        tree: null,
      });

    case GO_FORWARD:
      pathString = state.pathString.concat(action.location);
      return Object.assign({}, state, {
        pathString,
        location: traverseIntranet(state.tree, pathString),
      });
    case GO_TO_PATH:
      pathString = action.toPath || [];
      return Object.assign({}, state, {
        pathString,
        search: null,
        quickSearch: null,
        isSearching: false,
        location: processLocation(traverseIntranet(state.tree, pathString), pathString),
      });
    case ADD_FAV:
      return Object.assign({}, state, {
        fav: checkFav(state.fav, action.fav),
      });
    case QUICK_SEARCH:
      newSearchObj = new Immutable.List();
      processLocation(state.tree.get('Lecture'), ['Lecture']).forEach(v => {
        if (v.get('name').toLowerCase().indexOf(action.searchToken.toLowerCase()) > -1) {
          newSearchObj = newSearchObj.push(v);
        }
      });
      state.location.forEach(v => {
        if (v.get('name').toLowerCase().indexOf(action.searchToken.toLowerCase()) > -1) {
          newSearchObj = newSearchObj.push(v);
        }
      });
      return Object.assign({}, state, {
        quickSearch: newSearchObj,
        isSearching: true,
        searchError: null,
      });
    case LONG_SEARCH:
      // console.log(action.searchResults);
      return Object.assign({}, state, {
        search: state.isSearching ? action.searchResults : null,
        isSearching: false,
        searchError: null,
      });
    case SEARCH_ERROR:
      return Object.assign({}, state, {
        isSearching: false,
        search: null,
        quickSearch: null,
        searchError: action.error,
      });
    default:
      return state;
  }
}

const webmailState = {
  isFetching: false,
  isFetchingEmail: false,
  inbox: null,
  emailId: null,
  email: null,
  lastFetched: -Infinity,
  error: null,
};

export function webmail(state=webmailState, action) {
  switch (action.type) {
    case REQUEST_INBOX:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case RECEIVE_INBOX:
      return Object.assign({}, state, {
        inbox: Immutable.fromJS(action.inbox.slice(0, INBOX_LIMIT)),
        lastFetched: Date.now(),
        isFetching: false,
      });
    case RECEIVE_INBOX_ERROR:
      return Object.assign({}, state, {
        error: action.error,
        isFetching: false,
      });
    case REQUEST_EMAIL:
      return Object.assign({}, state, {
        isFetchingEmail: true,
        emaildId: action.emailId,
      });
    case RECEIVE_EMAIL:
      return Object.assign({}, state, {
        isFetchingEmail: false,
        email: action.email,
      });
    case RECEIVE_EMAIL_ERROR:
      return Object.assign({}, state, {
        isFetchingEmail: false,
        error: action.error,
      });
    default:
      return state;
  }
}

export function chat(state = chatState, action) {
  switch (action.type) {
    case RECEIVED_CHAT:
      return Object.assign({}, { chats: [...action.chatArray] });
    case CLEAR_CHAT:
      return Object.assign({}, {
        chats: [],
      });
    default:
      return state;
  }
}

const initialProfileState = {
  id: null,
  name: null,
  gettingName: false,
  settingName: false,
  error: null,
};

export function profile(state= initialProfileState, action) {
  switch (action.type) {
    case SET_PROFILE_ID:
      return Object.assign({}, state, {
        id: action.id,
      });
    case GETTING_PROFILE_NAME:
      return Object.assign({}, state, {
        gettingName: true,
        settingName: false,
      });
    case GOT_PROFILE_NAME:
      return Object.assign({}, state, {
        name: action.name,
        gettingName: false,
      });
    case GOT_ERROR:
      return Object.assign({}, state, {
        error: action.error,
      });
    case SETTING_PROFILE_NAME:
      return Object.assign({}, state, {
        settingName: true,
        gettingName: false,
      });
    default:
      return state;
  }
}

const initialDashboard = {
  widgets: [{
    id: 1,
    text: 'Intranet',
    display: true,
  }, {
    id: 2,
    text: 'Webmail',
    display: true,
  }, {
    id: 3,
    text: 'Chat',
    display: true,
  }, {
    id: 4,
    text: 'Todo',
    display: true,
  }],
};

export function dashboard(state=initialDashboard, action) {
  switch (action.type) {
    case ADD_TO_WIDGETS:
      return Object.assign({}, state, {
        widgets: action.widgets,
      });
    default:
      return state;
  }
}
export default combineReducers({ todo, login, intranet, chat, webmail, profile, dashboard });
