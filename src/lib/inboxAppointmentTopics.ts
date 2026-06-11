export type InboxAppointmentTopicId =
  | 'confirmAppointments'
  | 'scheduleAppointments'
  | 'rescheduleAppointments'
  | 'cancelAppointments'
  | 'appointmentReminders'
  | 'checkAvailability';

export type InboxAppointmentPrimaryToggleId =
  | 'confirmAppointments'
  | 'cancelAppointments'
  | 'rescheduleAppointments';

export type InboxAppointmentTopics = Record<InboxAppointmentTopicId, boolean>;

export const INBOX_APPOINTMENT_PRIMARY_TOGGLES: InboxAppointmentPrimaryToggleId[] = [
  'confirmAppointments',
  'cancelAppointments',
  'rescheduleAppointments',
];

export const DEFAULT_INBOX_APPOINTMENT_TOPICS: InboxAppointmentTopics = {
  confirmAppointments: true,
  scheduleAppointments: false,
  rescheduleAppointments: true,
  cancelAppointments: true,
  appointmentReminders: false,
  checkAvailability: false,
};

export function parseInboxAppointmentTopics(raw: unknown): InboxAppointmentTopics {
  const base = { ...DEFAULT_INBOX_APPOINTMENT_TOPICS };
  if (!raw || typeof raw !== 'object') return base;
  const o = raw as Record<string, unknown>;
  for (const id of INBOX_APPOINTMENT_PRIMARY_TOGGLES) {
    if (typeof o[id] === 'boolean') base[id] = o[id];
  }
  return base;
}

export function enabledInboxAppointmentTopicIds(
  topics: InboxAppointmentTopics,
): InboxAppointmentPrimaryToggleId[] {
  return INBOX_APPOINTMENT_PRIMARY_TOGGLES.filter((id) => topics[id]);
}

export function toggleInboxAppointmentTopic(
  topics: InboxAppointmentTopics,
  id: InboxAppointmentPrimaryToggleId,
): InboxAppointmentTopics {
  return { ...topics, [id]: !topics[id] };
}
