/*
 * Copyright 2020 The Backstage Authors
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

import {
  AlertApi,
  AlertMessage,
  NotificationApi,
  Notification,
} from '@backstage/core-plugin-api';
import { Observable } from '@backstage/types';
import { PublishSubject } from '../../../lib/subjects';
import { v4 as uuid } from 'uuid';

/**
 * Base implementation for the AlertApi that simply forwards alerts to consumers.
 *
 * @public
 */
export class AlertApiForwarder implements AlertApi {
  private readonly subject = new PublishSubject<AlertMessage>();

  constructor(private readonly notificationApi: NotificationApi) {
    notificationApi.notification$().subscribe(notification => {
      if (notification.kind === 'alert') {
        const alert: AlertMessage = {
          message: notification.metadata.message,
          severity: notification.spec?.severity,
        };
        this.subject.next(alert);
      }
    });
  }

  post(alert: AlertMessage) {
    const alertNotification: Notification = {
      kind: 'alert',
      metadata: {
        title: '',
        message: alert.message,
        uuid: uuid(),
        timestamp: Date.now(),
        severity: alert.severity,
      },
    };
    this.notificationApi.post(alertNotification);
  }

  alert$(): Observable<AlertMessage> {
    return this.subject;
  }
}
