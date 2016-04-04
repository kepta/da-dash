import {
  createTodo,
  deleteTodo,
  completeTodo,
  editTodo,
} from './todoActions';

import {
  setLogging,
  setLogout,
  setLoggedIn,
  setLoginError,
  verifyUser,
  setCredentials,
} from './loginActions';

import { getChat, sendChat, getUpdatedChat } from './chatActions';

export const actions = {
  createTodo,
  deleteTodo,
  completeTodo,
  editTodo,
  setLogging,
  setLogout,
  setLoggedIn,
  setLoginError,
  verifyUser,
  setCredentials,
  getChat,
  sendChat,
  getUpdatedChat,
};
