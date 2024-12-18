/**
 * @file A base UI component template
 * @description Generated by the agent. Update props and logic as needed.
 */

import React from 'react';

/**
 * Props for ComponentName
 * @interface ComponentNameProps
 * @property {string} [exampleProp] - An example prop
 */
interface ComponentNameProps {
  exampleProp?: string;
}

/**
 * A newly generated component named ComponentName
 * @param {ComponentNameProps} props - Component properties
 * @returns {JSX.Element}
 */
export function ComponentName(props: ComponentNameProps): JSX.Element {
  return <div>{props.exampleProp || 'Default Content'}</div>;
}
