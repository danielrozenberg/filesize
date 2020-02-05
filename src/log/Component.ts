/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Context } from '../validation/Condition';

interface ComponentInterface<P = {}, S = {}> {
  render(props: P, context: Context): void;
  lines: number;
  props: P;
  state: S;
  setState(update: Partial<P>, callback: () => void): void;
}

class Component<Props = {}, State = {}> implements ComponentInterface {
  private props: Props = {};
  private state: State = {};
  private nextState: State = {};
  private lines: number = 0;
  private renderCallbacks: Array<() => void> = [];
  public dirty: boolean = false;

  render(props: Props, context: Context): void {}

  setState(update: Partial<State>, callback?: () => void): void {
    let state: State;
    if (this.nextState !== this.state) {
      state = this.nextState;
    } else {
      state = this.nextState = { ...this.state };
    }

    if (update) {
      Object.assign(state, update);
    }

    if (callback) {
      this.renderCallbacks.push(callback);
    }

    queueRendering(this);
  }
}

// KRIS: You left off here, this is a gutted implementation of Preact.
// https://github.com/preactjs/preact/blob/master/src/component.js

const defer = Promise.prototype.then.bind(Promise.resolve());
const renderQueue: Array<Component> = [];
export function enqueueRender(component: Component): void {
  if (!component.dirty) {
    component.dirty = true;
    renderQueue.push(component);
    defer(process);
  }
}

// Could we use a Tree to Store This data?
// ---- TOP ----
// INNER - INNER

function processQueuedRenders() {
  let process;
  renderQueue.sort((a: Component, b: Component) => b._vnode._depth - a._vnode._depth);
  while ((p = q.pop())) {
    // forceUpdate's callback argument is reused here to indicate a non-forced update.
    if (p._dirty) renderComponent(p);
  }
}

// let Component: Component = function(this: Component, props: {}, context: Context) {
//   this.props = props;
//   this.context = context;
// };

// Component.prototype.setState = function(update: Partial<P>, callback) {
//   // only clone state when copying to nextState the first time.
//   let s;
//   if (this._nextState !== this.state) {
//     s = this._nextState;
//   } else {
//     s = this._nextState = assign({}, this.state);
//   }

//   if (typeof update == 'function') {
//     update = update(s, this.props);
//   }

//   if (update) {
// 	assign(s, update);
// }

// // Skip update if updater function returned null
// if (update == null) return;

// if (this._vnode) {
// 	if (callback) this._renderCallbacks.push(callback);
// 	enqueueRender(this);
// }
// };
