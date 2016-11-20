/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactNativeFiberComponent
 * @flow
 */

'use strict';

import type { HostChildren } from 'ReactFiberReconciler';

var React = require('react/lib/React');
var ReactNativeTagHandles = require('ReactNativeTagHandles');
var ReactNativeAttributePayload = require('ReactNativeAttributePayload');

export type Props = { [key: any]: any };

type ReactTag = number;
export type Container = ReactTag;

type NodeTextType = 3;
type NodeViewType = 1;

export type Instance = {
  type: string;
  _rootNodeID: ReactTag;
  nodeType: NodeViewType;
  children: Array<ReactTag>;
};

export type TextInstance = {
  type: 'RCTRawText';
  _rootNodeID: ReactTag;
  nodeType: NodeTextType;
  text: string;
};

type ViewConfig = {
  validAttributes: Object;
  uiViewClassName: string;
  propTypes?: Object;
};

var viewConfigMap = new Map();

var ReactNativeFiberComponent = {
  createInstance(type: string): Instance {
    const _rootNodeID = ReactNativeTagHandles.allocateTag();
    return { nodeType: 1, type, _rootNodeID, children: [] };
  },
  createTextInstance(text: string): TextInstance {
    const _rootNodeID = ReactNativeTagHandles.allocateTag();
    return { nodeType: 3, _rootNodeID, type: 'RCTRawText', text: '' + text };
  },
  getInitialProperties(type: string, props: Props): ?Props {
    const viewConfig: ?ViewConfig = viewConfigMap.get(type);
    if (!viewConfig) {
      throw new Error(type + ' does not have a view config registered');
    }

    return ReactNativeAttributePayload.create(props, viewConfig.validAttributes);
  },
  getDiffProperties(type: string, oldProps: Props, newProps: Props): ?Props {
    const viewConfig = viewConfigMap.get(type);
    if (!viewConfig) {
      return null;
    }

    return ReactNativeAttributePayload.diff(oldProps, newProps, viewConfig.validAttributes);
  },
  createComponent(viewConfig: ViewConfig): ReactClass<*> {
    const id = viewConfig.uiViewClassName;
    viewConfigMap.set(id, viewConfig);

    const func = (props: Props) => {
      return React.createElement(id, props);
    };
    func.propTypes = viewConfig.propTypes;

    return func;
  }
};

module.exports = ReactNativeFiberComponent;