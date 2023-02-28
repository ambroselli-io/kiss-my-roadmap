import { useEffect, useRef, useState } from "react";
import { useSearchParams, useTransition } from "@remix-run/react";

export const mergeSearchParam = (
  newParams = [],
  searchParams = new URLSearchParams()
) => {
  for (const { param, value, action = "merge" } of newParams) {
    searchParams = new URLSearchParams(searchParams);
    if (action === "merge") searchParams.set(param, value);
    if (action === "delete") searchParams.delete(param);
  }
  return searchParams;
};

/*
useMergeSearchParams
as in `[searchParams, mergeSearchParams] = useMergeSearchParams()`

setSearchParams({ neParam: 'whatever' }) replaces all the query params with the newParam
mergeSearchParams({ neParam: 'whatever' }) merges the newParam within the existing query params

*/

export const useMergeSearchParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const mergeSearchParams = (newParams, navigateOptions = {}) => {
    const searchParamsObject = {};
    for (const [key, param] of searchParams.entries()) {
      searchParamsObject[key] = param;
    }
    for (const [key, param] of Object.entries(newParams)) {
      if (param == null) delete searchParamsObject[key]; // check null or undefined
      else searchParamsObject[key] = param;
    }
    setSearchParams(searchParamsObject, navigateOptions);
  };

  return mergeSearchParams;
};

/*

useSearchParamState
as in `[state, setState] = useSearchParamState(initialValue)`

I think not so useful in Remix actually, more useful in a create-react-app

*/

const setDataAsSearchParam = (data) => {
  if (typeof data === "string") return data;
  if (typeof data === "number") return data;
  if (typeof data === "boolean") return data;
  return JSON.stringify(data);
};

const getDataAsSearchParam = (data, defaultValue) => {
  if (!data) return null;
  // handle objects
  if (data === "null") return null;
  if (data === "undefined") return undefined;
  if (typeof defaultValue === "string") return data;
  if (typeof defaultValue === "number") return Number(data);
  if (typeof data === "boolean" || ["false", "true"].includes(data)) {
    if (data === "false") return false;
    if (data === "true") return true;
    return Boolean(data);
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    // should be string
    return data;
  }
};

// NOTE: its not possible to update two different URLSearchParams very quickly, the second one cancels the first one

const useSearchParamState = (
  param,
  defaultAndInitialValue,
  {
    resetOnValueChange = null,
    setSearchParamOnMount = true,
    listenToUrlChanges = true,
    removeParamOnDefaultValue = true,
  } = {}
) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const transition = useTransition();

  const [state, setState] = useState(
    () =>
      getDataAsSearchParam(searchParams.get(param), defaultAndInitialValue) ||
      defaultAndInitialValue
  );

  const setStateRequest = (newState, { sideEffects = {} } = {}) => {
    if (window) {
      const searchParams = new URLSearchParams(location.search);
      searchParams.set(param, setDataAsSearchParam(newState));
      // its not possible to update two different URLSearchParams very quickly
      // that's why, if really needed, there is this side effect option
      // to update two different URLSearchParams very quickly
      for (const sideEffectParam of Object.keys(sideEffects)) {
        searchParams.set(
          sideEffectParam,
          setDataAsSearchParam(sideEffects[sideEffectParam])
        );
      }
      if (removeParamOnDefaultValue && newState === defaultAndInitialValue) {
        searchParams.delete(param);
      }
      setSearchParams(searchParams);
      // returns the existing query string: '?type=fiction&author=fahid'
    }
    setState(newState);
  };

  const resetKeyRef = useRef(resetOnValueChange);
  useEffect(() => {
    // effect not triggered on mount
    if (resetOnValueChange !== resetKeyRef.current) {
      setStateRequest(defaultAndInitialValue);
      resetKeyRef.current = resetOnValueChange;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetOnValueChange]);

  useEffect(() => {
    if (!getDataAsSearchParam(searchParams.get(param)) && setSearchParamOnMount) {
      setStateRequest(defaultAndInitialValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setSearchParamOnMount]);

  useEffect(() => {
    if (listenToUrlChanges && transition?.location?.search) {
      const paramExistsInUrl = transition?.location?.search?.indexOf(`${param}=`) !== -1;
      if (!paramExistsInUrl) return;
      const paramValue = getDataAsSearchParam(
        new URLSearchParams(transition?.location.search).get(param),
        defaultAndInitialValue
      );
      if (paramValue !== state) {
        setStateRequest(paramValue);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listenToUrlChanges, transition?.location?.search]);

  return [state, setStateRequest];
};

export default useSearchParamState;
