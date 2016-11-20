/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactNativeFiber
 * @flow
 */

'use strict';

import type { HostChildren } from 'ReactFiberReconciler';
import type { Instance, TextInstance, Container, Props } from 'ReactNativeFiberComponent';

var ReactFiberReconciler = require('ReactFiberReconciler');
var warning = require('fbjs/lib/warning');
var UIManager = require('UIManager');
var ReactNativeFiberComponent = require('ReactNativeFiberComponent');
var ReactNativeComponentTree = require('ReactNativeComponentTree');
var {
  precacheFiberNode
} = ReactNativeComponentTree;

function flattenChildren(child: HostChildren<Instance | TextInstance>) {
  let children = [];
  if (!child) {
    return children;
  }

  /* $FlowFixMe */
  if (child.nodeType === 1 || child.nodeType === 3) {
    children.push(child._rootNodeID);
  } else {
    /* As a result of the refinement issue this type isn't known. */
    let node: any = child;
    do {
      children = [...children, ...flattenChildren(node.output)];
    } while (node = node.sibling);
  }

  return children;
}

function flattenChildrenObj(child: HostChildren<Instance | TextInstance>) {
  let children = [];
  if (!child) {
    return children;
  }

  /* $FlowFixMe */
  if (child.nodeType === 1 || child.nodeType === 3) {
    children.push(child);
  } else {
    /* As a result of the refinement issue this type isn't known. */
    let node: any = child;
    do {
      children = [...children, ...flattenChildren(node.output)];
    } while (node = node.sibling);
  }

  return children;
}

var NativeRenderer = ReactFiberReconciler({

  updateContainer(container: Container, children: HostChildren<Instance | TextInstance>): void {
    const child = flattenChildren(children);
    UIManager.removeChildren(container, child);
    UIManager.setChildren(container, child);
  },

  createInstance(type: string, props: Props, children: HostChildren<Instance | TextInstance>, internalInstanceHandle: Object): Instance {
    const rootTag = 1; // HACK
    const instance = ReactNativeFiberComponent.createInstance(type);
    precacheFiberNode(internalInstanceHandle, instance._rootNodeID);

    const payload = ReactNativeFiberComponent.getInitialProperties(type, props);

    UIManager.createView(instance._rootNodeID, instance.type, rootTag, payload);

    if (typeof props.children === 'string' || typeof props.children === 'number') {
      const textInstance = ReactNativeFiberComponent.createTextInstance(props.children);

      UIManager.createView(textInstance._rootNodeID, textInstance.type, rootTag, { text: textInstance.text });
      UIManager.setChildren(instance._rootNodeID, [textInstance._rootNodeID]);
    } else {
      instance.children = flattenChildren(children);
      UIManager.setChildren(instance._rootNodeID, instance.children.slice());
    }

    return instance;
  },

  prepareUpdate(domElement: Instance, oldProps: Props, newProps: Props): bool {
    return true;
  },

  commitUpdate(instance: Instance, oldProps: Props, newProps: Props): void {
    const { _rootNodeID, type } = instance;

    const updatePayload = ReactNativeFiberComponent.getDiffProperties(type, oldProps, newProps);

    if (updatePayload) {
      UIManager.updateView(_rootNodeID, type, updatePayload);
    }
  },

  createTextInstance(text: string, internalInstanceHandle: Object): TextInstance {
    const rootTag = 1; // HACK
    const instance = ReactNativeFiberComponent.createTextInstance(text);
    precacheFiberNode(internalInstanceHandle, instance._rootNodeID);

    UIManager.createView(instance._rootNodeID, 'RCTRawText', rootTag, { text: '' + instance.text });
    return instance;
  },

  commitTextUpdate(textInstance: TextInstance, oldText: string, newText: string): void {
    const { _rootNodeID, type } = textInstance;

    if (oldText !== newText) {
      textInstance.text = newText;
      UIManager.updateView(_rootNodeID, type, { text: '' + newText });
    }
  },

  appendChild(parentInstance: Instance, child: Instance | TextInstance): void {
    const newChild = parentInstance.children.concat([child._rootNodeID]);
    parentInstance.children = newChild;

    UIManager.manageChildren(parentInstance._rootNodeID, [], // moveFromIndices,
    [], // moveToIndices,
    [child._rootNodeID], // addChildTags,
    [newChild.length - 1], // addAtIndices,
    [] // removeAtIndices
    );
  },

  insertBefore(parentInstance: Instance, child: Instance | TextInstance, beforeChild: Instance | TextInstance): void {
    console.log('before', parentInstance, child);
  },

  removeChild(parentInstance: Instance, child: Instance | TextInstance): void {
    console.log('remove child');
    const indexToRemove = parentInstance.children.indexOf(child._rootNodeID);
    parentInstance.children.splice(indexToRemove, 1);
    UIManager.manageChildren(parentInstance._rootNodeID, [], // moveFromIndices,
    [], // moveToIndices,
    [], // addChildTags,
    [], // addAtIndices,
    [indexToRemove] // removeAtIndices
    );
  },

  scheduleAnimationCallback: global.requestAnimationFrame,

  scheduleDeferredCallback: global.requestIdleCallback,

  useSyncScheduling: true

});
var warned = false;

function warnAboutUnstableUse() {
  // Ignore this warning is the feature flag is turned on. E.g. for tests.
  warning(warned, 'You are using React Native Fiber which is an experimental renderer. ' + 'It is likely to have bugs, breaking changes and is unsupported.');
  warned = true;
}

var ReactNative = {
  _instancesByContainerID: {},

  renderComponent(element: ReactElement<any>, containerTag: number, callback: ?Function) {
    warnAboutUnstableUse();
    const instances = ReactNative._instancesByContainerID;
    let root = instances[containerTag];

    if (!root) {
      root = NativeRenderer.mountContainer(element, containerTag, callback);
      instances[containerTag] = root;
    } else {
      NativeRenderer.updateContainer(element, root, callback);
    }

    return NativeRenderer.getPublicRootInstance(root);
  },

  unmountComponentAtNode(container: DOMContainerElement) {
    throw new Error('Not done');
  },

  unstable_batchedUpdates<A>(fn: () => A): A {
    return NativeRenderer.batchedUpdates(fn);
  },
  findNodeHandle(componentOrElement: Element | ?ReactComponent<any, any, any>): null | Element | Text {
    if (componentOrElement == null) {
      return null;
    }
    // Unsound duck typing.
    const component = (componentOrElement: any);
    if (component.nodeType === 1) {
      return component;
    }
    return NativeRenderer.findHostInstance(component)._rootNodeID;
  }
};

module.exports = ReactNative;