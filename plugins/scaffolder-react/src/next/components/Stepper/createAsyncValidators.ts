/*
 * Copyright 2022 The Backstage Authors
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

import { FieldValidation } from '@rjsf/utils';
import type { JsonObject, JsonValue } from '@backstage/types';
import { ApiHolder } from '@backstage/core-plugin-api';
import { Draft07 as JSONSchema } from 'json-schema-library';
import { createFieldValidation } from '../../lib';
import { NextCustomFieldValidator } from '../../extensions';
import { isObject } from './utils';

/**
 * @internal
 */
export type FormValidation = {
  [name: string]: FieldValidation | FormValidation;
};

export const createAsyncValidators = (
  rootSchema: JsonObject,
  validators: Record<string, undefined | NextCustomFieldValidator<unknown>>,
  context: {
    apiHolder: ApiHolder;
  },
) => {
  async function validate(
    formData: JsonObject,
    pathPrefix: string = '#',
    current: JsonObject = formData,
  ): Promise<FormValidation> {
    const parsedSchema = new JSONSchema(rootSchema);
    const formValidation: FormValidation = {};

    const validateForm = async (
      validatorName: string,
      key: string,
      value: JsonValue | undefined,
    ) => {
      const validator = validators[validatorName];
      if (validator) {
        const fieldValidation = createFieldValidation();
        try {
          await validator(value, fieldValidation, { ...context, formData });
        } catch (ex) {
          fieldValidation.addError(ex.message);
        }
        formValidation[key] = fieldValidation;
      }
    };

    for (const [key, value] of Object.entries(current)) {
      const path = `${pathPrefix}/${key}`;
      const definitionInSchema = parsedSchema.getSchema(path, formData);

      if (definitionInSchema && 'ui:field' in definitionInSchema) {
        if ('ui:field' in definitionInSchema) {
          await validateForm(definitionInSchema['ui:field'], key, value);
        }
      } else if (
        definitionInSchema &&
        definitionInSchema.items &&
        'ui:field' in definitionInSchema.items
      ) {
        if ('ui:field' in definitionInSchema.items) {
          await validateForm(definitionInSchema.items['ui:field'], key, value);
        }
      } else if (isObject(value)) {
        formValidation[key] = await validate(formData, path, value);
      }
    }

    return formValidation;
  }

  return async (formData: JsonObject) => {
    return await validate(formData);
  };
};
