/**
 * Estados de seguimiento para el panel del desarrollador (funnel simple).
 * Se mapean desde `application.status` del backend (`EApplicationStatus`).
 */
export type DevTrackingStepId = 'applied' | 'viewed' | 'in_process';

export type DevTrackingTerminalId = 'rejected' | 'finished';

export type LineStepState = 'completed' | 'current' | 'upcoming';

export type TerminalStepState = 'pending' | 'current' | 'excluded';

export type DevTrackingViewModel = {
  mainLine: { id: DevTrackingStepId; state: LineStepState }[];
  /** Última etapa: solo una de las dos puede quedar "current"; la otra queda `excluded` o en `pending`. */
  terminal: {
    rejected: { id: 'rejected'; state: TerminalStepState };
    finished: { id: 'finished'; state: TerminalStepState };
  };
};

function terminalRejected(): DevTrackingViewModel['terminal'] {
  return {
    rejected: { id: 'rejected', state: 'current' },
    finished: { id: 'finished', state: 'excluded' },
  };
}

function terminalFinished(): DevTrackingViewModel['terminal'] {
  return {
    rejected: { id: 'rejected', state: 'excluded' },
    finished: { id: 'finished', state: 'current' },
  };
}

function terminalPending(): DevTrackingViewModel['terminal'] {
  return {
    rejected: { id: 'rejected', state: 'pending' },
    finished: { id: 'finished', state: 'pending' },
  };
}

/**
 * Mapeo real del estado API hacia el funnel de UI.
 * Referencia backend: `adminvado/src/constants/EApplicationStatus.ts`.
 */
export function getDevApplicationTrackingFromStatus(rawStatus: string): DevTrackingViewModel {
  const status = rawStatus.trim().toLowerCase();

  // Estados terminales (resultado final)
  if (status === 'accepted') {
    return {
      mainLine: [
        { id: 'applied', state: 'completed' },
        { id: 'viewed', state: 'completed' },
        { id: 'in_process', state: 'completed' },
      ],
      terminal: terminalFinished(),
    };
  }
  if (status === 'rejected' || status === 'withdrawn' || status === 'mismatched') {
    return {
      mainLine: [
        { id: 'applied', state: 'completed' },
        { id: 'viewed', state: 'completed' },
        { id: 'in_process', state: 'completed' },
      ],
      terminal: terminalRejected(),
    };
  }

  // Funnel intermedio
  if (status === 'applied') {
    return {
      mainLine: [
        { id: 'applied', state: 'current' },
        { id: 'viewed', state: 'upcoming' },
        { id: 'in_process', state: 'upcoming' },
      ],
      terminal: terminalPending(),
    };
  }
  if (status === 'short listed') {
    return {
      mainLine: [
        { id: 'applied', state: 'completed' },
        { id: 'viewed', state: 'current' },
        { id: 'in_process', state: 'upcoming' },
      ],
      terminal: terminalPending(),
    };
  }

  // TPS Requested, Verified, Client Proposed u otros estados no terminales
  return {
    mainLine: [
      { id: 'applied', state: 'completed' },
      { id: 'viewed', state: 'completed' },
      { id: 'in_process', state: 'current' },
    ],
    terminal: terminalPending(),
  };
}

/**
 * Mock determinista por posición de la fila. Rotación de escenarios para poder ver todos los
 * estados (una sola postulación = índice 0, típicamente "solo aplicó").
 */
export function getMockDevApplicationTracking(ordinalIndex: number): DevTrackingViewModel {
  const i = ((ordinalIndex % 5) + 5) % 5;

  if (i === 0) {
    return {
      mainLine: [
        { id: 'applied', state: 'current' },
        { id: 'viewed', state: 'upcoming' },
        { id: 'in_process', state: 'upcoming' },
      ],
      terminal: {
        rejected: { id: 'rejected', state: 'pending' },
        finished: { id: 'finished', state: 'pending' },
      },
    };
  }

  if (i === 1) {
    return {
      mainLine: [
        { id: 'applied', state: 'completed' },
        { id: 'viewed', state: 'current' },
        { id: 'in_process', state: 'upcoming' },
      ],
      terminal: {
        rejected: { id: 'rejected', state: 'pending' },
        finished: { id: 'finished', state: 'pending' },
      },
    };
  }

  if (i === 2) {
    return {
      mainLine: [
        { id: 'applied', state: 'completed' },
        { id: 'viewed', state: 'completed' },
        { id: 'in_process', state: 'current' },
      ],
      terminal: {
        rejected: { id: 'rejected', state: 'pending' },
        finished: { id: 'finished', state: 'pending' },
      },
    };
  }

  if (i === 3) {
    return {
      mainLine: [
        { id: 'applied', state: 'completed' },
        { id: 'viewed', state: 'completed' },
        { id: 'in_process', state: 'completed' },
      ],
      terminal: {
        rejected: { id: 'rejected', state: 'excluded' },
        finished: { id: 'finished', state: 'current' },
      },
    };
  }

  return {
    mainLine: [
      { id: 'applied', state: 'completed' },
      { id: 'viewed', state: 'completed' },
      { id: 'in_process', state: 'completed' },
    ],
    terminal: {
      rejected: { id: 'rejected', state: 'current' },
      finished: { id: 'finished', state: 'excluded' },
    },
  };
}
