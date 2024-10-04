import { render, screen, act } from '@testing-library/react';
import React from 'react';
import useTreeState, { findTargetPathByProp } from '../index';
import {
  deepClone,
  findTargetNode,
  setAllCheckedStatus,
  setAllOpenStatus,
  checkNode,
  toggleOpen,
  renameNode,
  deleteNode,
  addNode,
} from '../utils';
import {
  testData,
  initializedTestData,
} from './testData';

const renameToPikachuNTimes = (root, path, n) => {
  const targetNode = findTargetNode(root, path);
  targetNode.name = 'pikachu'.repeat(n);
  return { ...root };
};

const renameToGokuByName = (root, _, targetName) => {
  const path = findTargetPathByProp(root, 'name', targetName);
  const targetNode = findTargetNode(root, path);
  targetNode.name = 'Goku';
  return { ...root };
};

function TreeStateTestComponent({ data, options, onRender }) {
  const { treeState, reducers } = useTreeState({ data, options });

  if (onRender) {
    onRender({ treeState, reducers });
  }

  return <div data-testid='treeState'>{JSON.stringify(treeState)}</div>;
}

beforeAll(() => {
  global.document = window.document;
  global.window = window;
});

describe('initialize tree state', () => {
  test('default options', () => {
    const { getByTestId } = render(<TreeStateTestComponent data={ testData } />);

    expect(JSON.parse(getByTestId('treeState').textContent)).toEqual(initializedTestData);
  });

  test('custom initCheckedStatus = checked', () => {
    const expected = setAllCheckedStatus(deepClone(initializedTestData), 1);
    const options = {
      initCheckedStatus: 'checked',
    };

    const { getByTestId } = render(<TreeStateTestComponent data={ testData } options={ options } />);

    expect(JSON.parse(getByTestId('treeState').textContent)).toEqual(expected);
  });

  test('custom initCheckedStatus = unchecked', () => {
    const expected = setAllCheckedStatus(deepClone(initializedTestData), 0);
    const options = {
      initCheckedStatus: 'unchecked',
    };

    const { getByTestId } = render(<TreeStateTestComponent data={ testData } options={ options } />);

    expect(JSON.parse(getByTestId('treeState').textContent)).toEqual(expected);
  });

  test('custom initOpenStatus = open', () => {
    const expected = setAllOpenStatus(deepClone(initializedTestData), true);
    const options = {
      initOpenStatus: 'open',
    };

    const { getByTestId } = render(<TreeStateTestComponent data={ testData } options={ options } />);

    expect(JSON.parse(getByTestId('treeState').textContent)).toEqual(expected);
  });

  test('custom initOpenStatus = closed', () => {
    const expected = setAllOpenStatus(deepClone(initializedTestData), false);
    const options = {
      initOpenStatus: 'closed',
    };

    const { getByTestId } = render(<TreeStateTestComponent data={ testData } options={ options } />);

    expect(JSON.parse(getByTestId('treeState').textContent)).toEqual(expected);
  });
});

describe('check node', () => {
  test('by path', () => {
    let renderedData;
    render(<TreeStateTestComponent
      data={ testData }
      onRender={ data => (renderedData = data) }
    />);

    const { treeState, reducers } = renderedData;
    const { checkNode: check } = reducers;
    let expected;

    expected = checkNode(deepClone(treeState), [], 1);
    act(() => {
      check([], 1);
    });
    expect(JSON.parse(screen.getByTestId('treeState').textContent)).toEqual(expected);

    expected = checkNode(deepClone(treeState), [1], 0);
    act(() => {
      check([1], 0);
    });
    expect(JSON.parse(screen.getByTestId('treeState').textContent)).toEqual(expected);

    expected = checkNode(deepClone(treeState), [3, 1], 0);
    act(() => {
      check([3, 1], 0);
    });
    expect(JSON.parse(screen.getByTestId('treeState').textContent)).toEqual(expected);
  });

  test('by prop', () => {
    let renderedData;
    render(<TreeStateTestComponent data={ testData } onRender={ data => (renderedData = data) } />);

    const { treeState, reducers } = renderedData;
    const { checkNodeByProp: checkByProp } = reducers;
    let expected;

    expected = deepClone(treeState);
    act(() => {
      checkByProp('name', 'not exist', 1);
    });
    expect(JSON.parse(screen.getByTestId('treeState').textContent)).toEqual(expected);

    expected = deepClone(treeState);
    act(() => {
      checkByProp('not exist', 123, 1);
    });
    expect(JSON.parse(screen.getByTestId('treeState').textContent)).toEqual(expected);

    expected = checkNode(deepClone(treeState), [], 1);
    act(() => {
      checkByProp('name', 'All Cryptos', 1);
    });
    expect(JSON.parse(screen.getByTestId('treeState').textContent)).toEqual(expected);

    expected = checkNode(deepClone(treeState), [4, 1], 0);
    act(() => {
      checkByProp('_id', 10, 0);
    });
    expect(JSON.parse(screen.getByTestId('treeState').textContent)).toEqual(expected);
  });
});

describe('toggle open', () => {
  test('by path', () => {
    let renderedData;

    render(
      <TreeStateTestComponent
        data={ testData }
        onRender={ data => {
          renderedData = data;
        } }
      />,
    );

    const { treeState, reducers } = renderedData;
    const { toggleOpen: toggle } = reducers;
    let expectedResult;

    expectedResult = toggleOpen(deepClone(treeState), [], 1);
    act(() => {
      toggle([], 1);
    });
    expect(JSON.parse(screen.getByTestId('treeState').textContent)).toEqual(expectedResult);

    expectedResult = toggleOpen(deepClone(treeState), [3], 0);
    act(() => {
      toggle([3], 0);
    });
    expect(JSON.parse(screen.getByTestId('treeState').textContent)).toEqual(expectedResult);

    try {
      toggle([3, 1], 0);
    } catch (e) {
      expect(e.message).toEqual('only parent node (folder) can be opened!!');
    }
  });

  test('by prop', () => {
    let renderedData;

    render(
      <TreeStateTestComponent
        data={ testData }
        onRender={ data => {
          renderedData = data;
        } }
      />,
    );

    const { treeState, reducers } = renderedData;
    const { toggleOpenByProp: toggleByProp } = reducers;
    let expectedResult;

    expectedResult = deepClone(treeState);
    act(() => {
      toggleByProp('name', 'not exist', 1);
    });
    expect(JSON.parse(screen.getByTestId('treeState').textContent)).toEqual(expectedResult);

    expectedResult = deepClone(treeState);
    act(() => {
      toggleByProp('not exist', 123, 1);
    });
    expect(JSON.parse(screen.getByTestId('treeState').textContent)).toEqual(expectedResult);

    expectedResult = toggleOpen(deepClone(treeState), [], 1);
    act(() => {
      toggleByProp('name', 'All Cryptos', 1);
    });
    expect(JSON.parse(screen.getByTestId('treeState').textContent)).toEqual(expectedResult);

    expectedResult = toggleOpen(deepClone(treeState), [4, 3], 0);
    act(() => {
      toggleByProp('_id', 15, 0);
    });
    expect(JSON.parse(screen.getByTestId('treeState').textContent)).toEqual(expectedResult);

    try {
      toggleByProp('name', 'Chainlink', 0);
    } catch (e) {
      expect(e.message).toEqual('only parent node (folder) can be opened!!');
    }
  });
});

describe('rename node', () => {
  test('by path', () => {
    let renderedData;

    render(
      <TreeStateTestComponent
        data={ testData }
        onRender={ data => {
          renderedData = data;
        } }
      />,
    );

    const { treeState, reducers } = renderedData;
    const { renameNode: rename } = reducers;
    let expectedResult;

    expectedResult = renameNode(deepClone(treeState), [], 'Bitcoin');
    act(() => {
      rename([], 'Bitcoin');
    });
    expect(JSON.parse(screen.getByTestId('treeState').textContent)).toEqual(expectedResult);

    expectedResult = renameNode(deepClone(treeState), [1], 'Polkadot');
    act(() => {
      rename([1], 'Polkadot');
    });
    expect(JSON.parse(screen.getByTestId('treeState').textContent)).toEqual(expectedResult);

    expectedResult = renameNode(deepClone(treeState), [3, 1], 'Kusama');
    act(() => {
      rename([3, 1], 'Kusama');
    });
    expect(JSON.parse(screen.getByTestId('treeState').textContent)).toEqual(expectedResult);
  });

  test('by prop', () => {
    let renderedData;

    render(
      <TreeStateTestComponent
        data={ testData }
        onRender={ data => {
          renderedData = data;
        } }
      />,
    );

    const { treeState, reducers } = renderedData;
    const { renameNodeByProp: renameByProp } = reducers;
    let expectedResult;
    const newName = 'Kusama';

    expectedResult = deepClone(treeState);
    act(() => {
      renameByProp('name', 'not exist', newName);
    });
    expect(JSON.parse(screen.getByTestId('treeState').textContent)).toEqual(expectedResult);

    expectedResult = deepClone(treeState);
    act(() => {
      renameByProp('not exist', 123, newName);
    });
    expect(JSON.parse(screen.getByTestId('treeState').textContent)).toEqual(expectedResult);

    expectedResult = renameNode(deepClone(treeState), [], newName);
    act(() => {
      renameByProp('name', 'All Cryptos', newName);
    });
    expect(JSON.parse(screen.getByTestId('treeState').textContent)).toEqual(expectedResult);

    expectedResult = renameNode(deepClone(treeState), [3, 0], newName);
    act(() => {
      renameByProp('_id', 5, newName);
    });
    expect(JSON.parse(screen.getByTestId('treeState').textContent)).toEqual(expectedResult);
  });
});

describe('add node', () => {
  test('by path', () => {
    let renderedData;

    render(
      <TreeStateTestComponent
        data={ testData }
        onRender={ data => {
          renderedData = data;
        } }
      />,
    );

    const { treeState, reducers } = renderedData;
    const { addNode: add } = reducers;
    let expected;

    expected = addNode(deepClone(treeState), [], false);
    act(() => {
      add([], false);
    });
    expect(JSON.parse(screen.getByTestId('treeState').textContent)).toEqual(expected);

    expected = addNode(deepClone(treeState), [4], true);
    act(() => {
      add([4], true);
    });
    expect(JSON.parse(screen.getByTestId('treeState').textContent)).toEqual(expected);

    try {
      add([1], true);
    } catch (e) {
      expect(e.message).toEqual('can\'t add node to a file!!');
    }
  });

  test('by prop', () => {
    let renderedData;

    render(
      <TreeStateTestComponent
        data={ testData }
        onRender={ data => {
          renderedData = data;
        } }
      />,
    );

    const { treeState, reducers } = renderedData;
    const { addNodeByProp: addByProp } = reducers;
    let expected;

    expected = deepClone(treeState);
    act(() => {
      addByProp('name', 'not exist', true);
    });
    expect(JSON.parse(screen.getByTestId('treeState').textContent)).toEqual(expected);

    expected = deepClone(treeState);
    act(() => {
      addByProp('not exist', 123, false);
    });
    expect(JSON.parse(screen.getByTestId('treeState').textContent)).toEqual(expected);

    expected = addNode(deepClone(treeState), [], true);
    act(() => {
      addByProp('name', 'All Cryptos', true);
    });
    expect(JSON.parse(screen.getByTestId('treeState').textContent)).toEqual(expected);

    try {
      addByProp('name', 'Ripple', false);
    } catch (e) {
      expect(e.message).toEqual('can\'t add node to a file!!');
    }
  });
});

describe('delete node', () => {
  test('by path', () => {
    let renderedData;

    render(
      <TreeStateTestComponent
        data={ testData }
        onRender={ data => {
          renderedData = data;
        } }
      />,
    );

    const { treeState, reducers } = renderedData;
    const { deleteNode: del } = reducers;
    let expected;

    expected = deleteNode(deepClone(treeState), [3, 1]);
    act(() => {
      del([3, 1]);
    });
    expect(JSON.parse(screen.getByTestId('treeState').textContent)).toEqual(expected);

    expected = deleteNode(deepClone(treeState), [2]);
    act(() => {
      del([2]);
    });
    expect(JSON.parse(screen.getByTestId('treeState').textContent)).toEqual(expected);

    expected = deleteNode(deepClone(treeState), []);
    act(() => {
      del([]);
    });
    expect(JSON.parse(screen.getByTestId('treeState').textContent)).toEqual(expected);
  });

  test('by prop', () => {
    let renderedData;

    render(
      <TreeStateTestComponent
        data={ testData }
        onRender={ data => {
          renderedData = data;
        } }
      />,
    );

    const { treeState, reducers } = renderedData;
    const { deleteNodeByProp: deleteByProp } = reducers;
    let expected;

    expected = deepClone(treeState);
    act(() => {
      deleteByProp('name', 'not exist');
    });
    expect(JSON.parse(screen.getByTestId('treeState').textContent)).toEqual(expected);

    expected = deleteNode(deepClone(treeState), [3, 0]);
    act(() => {
      deleteByProp('_id', 5);
    });
    expect(JSON.parse(screen.getByTestId('treeState').textContent)).toEqual(expected);

    expected = deleteNode(deepClone(treeState), []);
    act(() => {
      deleteByProp('name', 'All Cryptos');
    });
    expect(JSON.parse(screen.getByTestId('treeState').textContent)).toEqual(expected);
  });
});

test('set tree state directly', () => {
  let renderedData;

  render(
    <TreeStateTestComponent
      data={ testData }
      onRender={ data => {
        renderedData = data;
      } }
    />,
  );

  const { reducers } = renderedData;
  const { setTreeState } = reducers;

  const newState = {
    name: 'pikachu',
  };

  act(() => {
    setTreeState(newState);
  });
  expect(JSON.parse(screen.getByTestId('treeState').textContent)).toEqual(newState);
});

test('custom reducer', () => {
  const customReducers = {
    renameToPikachuNTimes,
    renameToGokuByName,
  };

  let renderedData;

  render(
    <TreeStateTestComponent
      data={ testData }
      customReducers={ customReducers }
      onRender={ data => {
        renderedData = data;
      } }
    />,
  );

  const { reducers, treeState } = renderedData;

  act(() => {
    reducers.renameToPikachuNTimes([], 2);
  });
  expect(JSON.parse(screen.getByTestId('treeState').textContent).name).toEqual('pikachupikachu');

  act(() => {
    reducers.renameToPikachuNTimes([3, 1], 3);
  });
  expect(JSON.parse(screen.getByTestId('treeState').textContent).children[3].children[1].name).toEqual('pikachupikachupikachu');

  act(() => {
    reducers.renameToGokuByName(null, 'pikachupikachupikachu');
  });
  expect(JSON.parse(screen.getByTestId('treeState').textContent).children[3].children[1].name).toEqual('Goku');
});
