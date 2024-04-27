import { callbackUrlQueryParamKey } from "../../domain/constants/auth";
import {
  AUTHORIZATION_CODE,
  SESSION_ID_KEY,
} from "../../domain/constants/storage";
/***
  Init in index file
***/
export const initLoginSessionWithAuth = () => {
  const url = new URL(window.location.href);
  const urlParams = url.searchParams;
  const authorizationCode = urlParams.get(callbackUrlQueryParamKey.CODE);
  const sessionId = urlParams.get(callbackUrlQueryParamKey.SESSION_ID);
  if (!authorizationCode) {
    return;
  }
  url.searchParams.delete(callbackUrlQueryParamKey.CODE);
  url.searchParams.delete(callbackUrlQueryParamKey.SESSION_ID);

  history.replaceState(history.state, "", url.href);
  sessionStorage.setItem(AUTHORIZATION_CODE, authorizationCode);
  localStorage.setItem(SESSION_ID_KEY, sessionId || "");
};
