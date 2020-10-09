import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import Term from '../src';

test('Term renders', () => {
  function Wrapper() {
    return (
      <MemoryRouter>
        <Term reference="test" popup="test">test</Term>,
      </MemoryRouter>
    )
  };
  const component = renderer.create(
    <Wrapper />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
