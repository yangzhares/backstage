/*
 * Copyright 2023 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { findPaths } from '@backstage/cli-common';
import * as path from 'path';

/* eslint-disable-next-line no-restricted-syntax */
const { targetRoot, resolveTargetRoot } = findPaths(__dirname);
export const APP_CONFIG_FILE = path.join(targetRoot, 'app-config.local.yaml');
export const ENV_CONFIG_FILE = path.join(targetRoot, '.env.local');
export const APP_TSX_FILE = path.join(
  resolveTargetRoot('packages/app'),
  'src',
  'App.tsx',
);
export const AUTH_BACKEND_PLUGIN_FILE = path.join(
  resolveTargetRoot('packages/backend'),
  'src',
  'plugins',
  'auth.ts',
);
