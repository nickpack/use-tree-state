import React, {
  useEffect,
  useState,
} from 'react';

import {
  initStateWithUniqIds,
  setAllCheckedStatus,
  setAllOpenStatus,
  isValidCheckedStatus,
  isValidOpenStatus,
  checkNode,
  renameNode,
  deleteNode,
  addNode,
  toggleOpen,
} from './utils';

const useTreeState = ({ data, options = {}, customReducers = {} }) => {
  const {
    initCheckedStatus = 'unchecked',
    initOpenStatus = 'open',
  } = options;

  const [treeState, setTreeState] = useState(null);

  const initTreeState = (_data, _initCheckedStatus, _initOpenStatus) => {
    let initState = initStateWithUniqIds(_data);

    switch (_initCheckedStatus) {
      case 'unchecked':
        initState = setAllCheckedStatus(initState, 0);
        break;

      case 'checked':
        initState = setAllCheckedStatus(initState, 1);
        break;

      default:
        if (!isValidCheckedStatus(initState)) {
          console.warn('checked status is not provided! Fell back to all unchecked.');
          initState = setAllCheckedStatus(initState, 0);
        }
    }

    switch (_initOpenStatus) {
      case 'open':
        initState = setAllOpenStatus(initState, true);
        break;

      case 'closed':
        initState = setAllOpenStatus(initState, false);
        break;

      default:
        if (!isValidOpenStatus(initState)) {
          console.warn('open status is not provided! Fell back to all opened.');
          initState = setAllOpenStatus(initState, true);
        }
    }

    return initState;
  };

  useEffect(() => {
    const initState = initTreeState(data, initCheckedStatus, initOpenStatus);
    setTreeState(initState);
  }, [data, initCheckedStatus, initOpenStatus]);

  const getExternalReducer = reducer => (path, ...params) => setTreeState(reducer(treeState, path, ...params));

  const _customReducers = Object.fromEntries(
    Object.entries(customReducers).map(
      ([name, f]) => ([name, getExternalReducer(f)])
    )
  );

  const reducers = {
    setTreeState,
    checkNode: getExternalReducer(checkNode),
    renameNode: getExternalReducer(renameNode),
    deleteNode: getExternalReducer(deleteNode),
    addNode: getExternalReducer(addNode),
    toggleOpen: getExternalReducer(toggleOpen),
    ..._customReducers,
  };

  return {
    treeState,
    reducers,
  };
};

export default useTreeState;
