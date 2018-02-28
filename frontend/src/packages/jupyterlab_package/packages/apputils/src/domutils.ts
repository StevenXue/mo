// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  ArrayExt,
} from '@phosphor/algorithm';

import {
  ElementExt,
} from '@phosphor/domutils';

import * as pathToRegexp from 'path-to-regexp';

/**
 * The namespace for DOM utilities.
 */
export namespace DOMUtils {
  /**
   * Get the index of the node at a client position, or `-1`.
   */
  export function hitTestNodes(nodes: HTMLElement[] | HTMLCollection, x: number, y: number): number {
    return ArrayExt.findFirstIndex(nodes, node => {
      return ElementExt.hitTest(node, x, y);
    });
  }

  /**
   * Find the first element matching a class name.
   */
  export function findElement(parent: HTMLElement, className: string): HTMLElement {
    return parent.querySelector(`.${className}`) as HTMLElement;
  }
}

/**
 * Get the index of the node at a client position, or `-1`.
 */
export function getProjectId(): string {
  const hash = window.location.hash;
  const match = pathToRegexp('#/workspace/:projectId/:type').exec(hash);
  if (match) {
    return match[1];
  }
}
