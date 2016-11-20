/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactNativeComponentTree
 * @flow
 */

'use strict';

import type { Fiber } from 'ReactFiber';

var invariant = require('fbjs/lib/invariant');
var { useFiber } = require('ReactNativeFeatureFlags');

var instanceCache = {};

/**
 * Drill down (through composites and empty components) until we get a host or
 * host text component.
 *
 * This is pretty polymorphic but unavoidable with the current structure we have
 * for `_renderedChildren`.
 */
function getRenderedHostOrTextFromComponent(component) {
  var rendered;
  while (rendered = component._renderedComponent) {
    component = rendered;
  }
  return component;
}

/**
 * Populate `_hostNode` on the rendered host/text component with the given
 * DOM node. The passed `inst` can be a composite.
 */
function precacheNode(inst: Object, tag: number) {
  var nativeInst = getRenderedHostOrTextFromComponent(inst);
  instanceCache[tag] = nativeInst;
}

function precacheFiberNode(inst: Object, tag: number) {
  instanceCache[tag] = inst;
}

function uncacheNode(inst: Object) {
  var tag = inst._rootNodeID;
  if (tag) {
    delete instanceCache[tag];
  }
}

function getInstanceFromTag(tag: number) {
  return instanceCache[tag] || null;
}

function getTagFromFiber(fiber: Fiber) {
  invariant(fiber.stateNode, 'All native instances should have a tag.');
  return fiber.stateNode._rootNodeID;
}

function getTagFromInstance(inst: Object) {
  invariant(inst._rootNodeID, 'All native instances should have a tag.');
  return inst._rootNodeID;
}

var ReactNativeComponentTree = {
  getClosestInstanceFromNode: getInstanceFromTag,
  getInstanceFromNode: getInstanceFromTag,
  getNodeFromInstance: useFiber ? getTagFromFiber : getTagFromInstance,
  precacheNode: precacheNode,
  uncacheNode: uncacheNode,
  precacheFiberNode: precacheFiberNode
};

module.exports = ReactNativeComponentTree;